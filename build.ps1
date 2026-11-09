# Builds index.html (single file, CSS and JS inline) at the repo root and the
# WordPress theme from the sources in src/. Run:
#
#   powershell -ExecutionPolicy Bypass -File build.ps1
#
# Edit src/_head.html, src/_body.html, src/css/theme.css or src/js/main.js.
# Never edit index.html or the theme's style.css, front-page.php or main.js:
# they are generated and will be overwritten.
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$src = Join-Path $root 'src'
$utf8 = New-Object System.Text.UTF8Encoding($false)

# CONFIRM: the inbox that receives quote requests on the static site. No address
# is published. While this is empty the static form asks the visitor to phone and
# copies their details. The WordPress theme sends real email either way.
$LeadEmail = ''

function Read-Src($name) { [IO.File]::ReadAllText((Join-Path $src $name), $utf8) }
function Write-Out($path, $text) {
  $dir = Split-Path $path
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
  [IO.File]::WriteAllText($path, $text.Replace("`r`n", "`n"), $utf8)
}

$head = Read-Src '_head.html'
$body = Read-Src '_body.html'
$css  = Read-Src 'css\theme.css'
$js   = Read-Src 'js\main.js'

function Minify-Css($s) {
  $s = [regex]::Replace($s, '(?s)/\*.*?\*/', '')
  $s = [regex]::Replace($s, '\s+', ' ')
  $s = [regex]::Replace($s, '\s*([{};,>])\s*', '$1')
  $s = $s.Replace(';}', '}')
  return $s.Trim()
}
function Minify-Js($s) {
  $s = [regex]::Replace($s, '(?s)/\*.*?\*/', '')
  $lines = $s -split "`r?`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('//') }
  return ($lines -join "`n")
}
# ---------------- inline line-art scenes ----------------
$body = [regex]::Replace($body, '<!--SCENE:([a-z-]+)(?::([A-Za-z]+))?-->', {
  param($m)
  $file = Join-Path $src ('plates\' + $m.Groups[1].Value + '.svg')
  if (-not (Test-Path $file)) { throw "Missing scene: $file" }
  $svg = [IO.File]::ReadAllText($file, $utf8).Trim()
  $align = if ($m.Groups[2].Success) { $m.Groups[2].Value } else { 'xMidYMid' }
  $svg = $svg -replace '<svg xmlns="http://www.w3.org/2000/svg" (viewBox="[^"]+") fill="none" stroke-linecap="round" stroke-linejoin="round">', ('<svg class="scene" $1 preserveAspectRatio="' + $align + ' slice" aria-hidden="true" focusable="false">')
  $svg = $svg -replace 'url\(#([cyh])\)', 'url(#pt-$1)'
  return ($svg -replace '\n', '')
})

# ---------------- van photo (only when the real file exists) ----------------
$vanFile = @('webp', 'jpg', 'jpeg', 'png') | ForEach-Object { Join-Path $root "assets\images\protac-van.$_" } | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($vanFile) {
  $size = (& ffprobe -v error -show_entries stream=width,height -of csv=p=0 $vanFile).Trim() -split ','
  $vanName = Split-Path $vanFile -Leaf
  $vanTag = '<figure class="van" data-rv="left" data-cursor="View"><div class="van__frame"><img src="{{A}}images/' + $vanName + '" width="' + $size[0] + '" height="' + $size[1] + '" loading="lazy" alt="ProTac Security patrol van"><p class="van__badge">On patrol across Santa Barbara &amp; SLO counties</p></div></figure>'
  $body = $body.Replace('<!--VAN-->', $vanTag).Replace('{{ABOUT_CLASS}}', 'about--van')
} else {
  $body = $body.Replace('<!--VAN-->', '').Replace('{{ABOUT_CLASS}}', 'about--novan')
}
"van photo: $(if ($vanFile) { Split-Path $vanFile -Leaf } else { 'NOT FOUND, About section built without an image' })"

$cssMin = Minify-Css $css
$jsMin  = Minify-Js $js

# ---------------- static HTML ----------------
if ($LeadEmail) { $formAction = "mailto:$LeadEmail"; $formMode = 'mailto' } else { $formAction = '#contact'; $formMode = 'none' }
$htmlBody = $body.Replace('{{A}}', 'assets/').Replace('{{FORM_ACTION}}', $formAction).Replace('{{FORM_MODE}}', $formMode)
$htmlBody = [regex]::Replace($htmlBody, '<!--WP:[a-z-]+-->', '')
$htmlHead = $head + "<link rel=""preload"" as=""image"" type=""image/webp"" href=""assets/images/hero-poster.webp"">`n"
# Client notes (CONFIRM/TODO) stay in src/ and never reach the published page.
$htmlBody = [regex]::Replace($htmlBody, '(?s)<!--.*?-->\n?', '')
$html = "<!doctype html>`n<html lang=""en"">`n<head>`n$htmlHead<style>$cssMin</style>`n</head>`n<body>`n$htmlBody`n<script>`n$jsMin`n</script>`n</body>`n</html>`n"
Write-Out (Join-Path $root 'index.html') $html
"index.html  $([math]::Round($html.Length / 1KB)) KB  (form: $formMode)"

# ---------------- WordPress theme ----------------
$theme = Join-Path $root 'wordpress-theme'

$styleHeader = @'
/*
Theme Name: ProTac Security
Author: Zaphyre
Description: One-page landing theme for ProTac Security, a licensed California Private Patrol Operator on the Central Coast. Set a static front page under Settings > Reading.
Version: 1.0.0
Requires at least: 6.0
Requires PHP: 7.4
License: GNU General Public License v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: protac
*/

/* WordPress admin bar offset for the sticky header. */
body.admin-bar #navigation { top: 32px; }
@media screen and (max-width: 782px) { body.admin-bar #navigation { top: 46px; } }
@media screen and (max-width: 600px) { body.admin-bar #navigation { top: 0; } }

'@
Write-Out (Join-Path $theme 'style.css') ($styleHeader + $css)
Write-Out (Join-Path $theme 'assets\js\main.js') $js

$wp = $body.Replace('{{A}}', '<?php echo esc_url( $protac_a ); ?>')
$wp = $wp.Replace('action="{{FORM_ACTION}}"', 'action="<?php echo esc_url( admin_url( ''admin-post.php'' ) ); ?>"')
$wp = $wp.Replace('data-mode="{{FORM_MODE}}"', 'data-mode="wp"')
$wp = $wp.Replace('<!--WP:contact-fields-->', '<input type="hidden" name="action" value="protac_contact"><?php wp_nonce_field( ''protac_contact'', ''protac_nonce'' ); ?>')
$wp = $wp.Replace('<!--WP:contact-status-->', '<?php echo esc_html( $protac_status[1] ); ?>')
$wp = $wp.Replace('class="form__status" id="form-status"', 'class="form__status <?php echo esc_attr( $protac_status[0] ); ?>" id="form-status"')
if ($wp -match '<!--WP:') { throw 'Unreplaced WP marker in body' }
if ($wp -match '\{\{') { throw 'Unreplaced {{ }} placeholder in body' }
$wp = [regex]::Replace($wp, '(?s)<!--.*?-->\n?', '')

$frontPage = @'
<?php
/**
 * Front page. Generated by build.ps1 from src/_body.html: edit the source, not this file.
 *
 * @package ProTac
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$protac_a      = trailingslashit( get_theme_file_uri( 'assets' ) );
$protac_status = protac_form_status();
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

'@ + $wp + @'

<?php wp_footer(); ?>
</body>
</html>

'@
Write-Out (Join-Path $theme 'front-page.php') $frontPage

if (Test-Path (Join-Path $theme 'assets\brand')) { Remove-Item (Join-Path $theme 'assets\brand') -Recurse -Force }
foreach ($sub in @('images', 'video')) {
  $from = Join-Path $root "assets\$sub"
  $dst = Join-Path $theme "assets\$sub"
  if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
  if (Test-Path $from) { Copy-Item $from $dst -Recurse -Force }
}
"wordpress-theme regenerated"
