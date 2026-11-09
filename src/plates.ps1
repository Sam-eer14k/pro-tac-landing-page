# Generates the line-art scenes in src/plates. build.ps1 inlines them into the page
# through <!--SCENE:name--> markers so CSS can animate their parts (a-* classes).
# Run after editing a scene:  powershell -ExecutionPolicy Bypass -File src\plates.ps1
$ErrorActionPreference = 'Stop'
$out = Join-Path $PSScriptRoot 'plates'
if (Test-Path $out) { Remove-Item (Join-Path $out '*') -Force }
New-Item -ItemType Directory -Force $out | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding($false)

function Plate($name, $w, $h, $body) {
  $svg = "<svg xmlns=`"http://www.w3.org/2000/svg`" viewBox=`"0 0 $w $h`" fill=`"none`" stroke-linecap=`"round`" stroke-linejoin=`"round`">`n$body`n</svg>`n"
  [IO.File]::WriteAllText((Join-Path $out "$name.svg"), $svg.Replace("`r`n", "`n"), $utf8)
}
function Guard($x, $y, $s = 1) {
  return "<g transform=`"translate($x $y) scale($s)`"><circle cx=`"0`" cy=`"-66`" r=`"10`" class=`"fd g`"/><path class=`"g`" d=`"M-11-71h22M-8-74c2-6 14-6 16 0`"/><path class=`"fd g`" d=`"M-15 -50c0-5 5-6 15-6s15 1 15 6v28h-5V0h-8V-18h-4V0h-8V-22h-5z`"/></g>"
}
function Checks($pts) { return ($pts | ForEach-Object { "<circle cx=`"$($_[0])`" cy=`"$($_[1])`" r=`"7`" class=`"fg`"/><circle cx=`"$($_[0])`" cy=`"$($_[1])`" r=`"13`" class=`"g1 a-ping`"/>" }) -join '' }

# ---- Services ----
Plate 'guard-post' 416 280 (@"
<path class="w1" d="M0 232H416"/>
<path class="a-flicker" fill="url(#y)" d="M78 40L0 232H220Z"/>
<path class="w" d="M78 30V232M64 30H92"/><circle class="fw a-flicker" cx="78" cy="38" r="6"/>
<rect x="238" y="96" width="120" height="136" rx="3" class="fd w"/><path class="g" d="M228 96H368L356 74H240Z"/><rect x="256" y="118" width="84" height="48" fill="#E3B85E" fill-opacity=".3" class="g1 a-glow"/><path class="w1" d="M298 118V166"/>
<rect x="130" y="176" width="20" height="56" class="fd w"/><path class="g" d="M150 186H232" stroke-dasharray="14 8"/>
$(Guard 196 232 1)
<path class="r" d="M0 256C100 244 200 268 300 254S400 250 416 256"/>
$(Checks @(,@(300,254)))
"@)

Plate 'mobile-patrol' 416 280 (@"
<path class="w1" d="M0 212H416"/><path class="w a-road" stroke-dasharray="26 18" d="M0 246H416"/>
<path class="w1" d="M0 212V128H62V90H118V148H176V212M300 212V100H352V66H416"/><path class="w1" d="M78 108h10M98 108h10M78 128h10M98 128h10M316 120h10M334 120h10M316 142h10M334 142h10M368 86h10M390 86h10"/>
<path class="a-beam" fill="url(#h)" d="M300 190L470 130V250Z"/>
<path class="fd w" d="M96 214V180c0-6 3-9 10-10l26-4 26-30c3-3 6-4 10-4h64c5 0 8 1 11 4l26 32 34 8c6 1 9 5 9 11v27z"/>
<path class="g" d="M140 166l22-24h40v24zM214 142h22c4 0 6 1 8 3l17 21h-47z"/>
<circle cx="150" cy="216" r="20" class="fb g"/><circle cx="264" cy="216" r="20" class="fb g"/><circle cx="150" cy="216" r="7" class="fg"/><circle cx="264" cy="216" r="7" class="fg"/>
<rect x="184" y="118" width="34" height="14" rx="3" class="ft a-blink"/>
<circle cx="303" cy="190" r="5" class="fw"/>
<path class="g" d="M96 196h200"/>
"@)

$bulbs = (20,62,104,146,188,230,272,314,356,398 | ForEach-Object { $y = 44 + [int](14*[math]::Sin(($_-20)/62)); "<circle cx=`"$_`" cy=`"$($y+8)`" r=`"3.5`" class=`"fw a-twinkle`" style=`"animation-delay:$(($_ % 7) * 150)ms`"/>" }) -join ''
$crowd = (30,70,112,150,194,232,274,312,352,392 | ForEach-Object { "<path class=`"fb w`" d=`"M$($_-16) 268c0-16 8-22 16-22s16 6 16 22z`"/><circle cx=`"$_`" cy=`"232`" r=`"10`" class=`"fb w`"/>" }) -join ''
Plate 'event-security' 416 280 (@"
<path class="w1" d="M0 226H416"/>
<path class="w" d="M86 226V70H330V226M86 92H330M86 70l-18-16M330 70l18-16"/>
<path class="fd" d="M108 112H308V200H108Z"/>
<path class="a-sway" fill="url(#c)" d="M150 92L112 200H204Z"/><path class="a-sway a-sway--2" fill="url(#y)" d="M266 92L212 200H304Z"/>
<path class="g1" d="M0 44Q104 76 208 42T416 44"/>
$bulbs
$crowd
<path class="g" d="M0 214H416M24 214v28M120 214v28M216 214v28M312 214v28M408 214v28"/>
"@)

$windows = (150,220,290 | ForEach-Object { $y=$_; (182,262,342 | ForEach-Object { "<rect x=`"$_`" y=`"$y`" width=`"50`" height=`"34`" class=`"w1`"/>" }) -join '' }) -join ''
Plate 'fire-watch' 416 280 (@"
<path class="w1" d="M0 236H416"/>
<rect x="150" y="96" width="250" height="140" rx="3" class="fd w"/>
<path class="w1" d="M150 142H400M150 188H400"/>
<rect x="176" y="108" width="46" height="24" class="w1"/><rect x="250" y="108" width="46" height="24" fill="#E3B85E" fill-opacity=".4" class="g a-glow"/><rect x="324" y="108" width="46" height="24" class="w1"/>
<rect x="176" y="154" width="46" height="24" class="w1"/><rect x="250" y="154" width="46" height="24" class="w1"/><rect x="324" y="154" width="46" height="24" class="w1"/>
<g class="a-flame"><path class="fg" d="M273 18c-8 16-28 24-28 50 0 18 13 30 28 30s28-12 28-30c0-13-6-20-11-27-2 7-6 11-10 12 2-13 0-25-7-35z"/><path class="fb" d="M273 54c-5 9-13 13-13 24 0 8 6 14 13 14s13-6 13-14c0-9-8-15-13-24z"/></g>
$(Guard 84 236 1.1)
<path class="a-sway" fill="url(#c)" d="M100 170L180 236H60Z" opacity=".6"/>
<path class="r" d="M0 260C100 248 200 272 300 258S400 254 416 260"/>
$(Checks @(@(84,258),@(300,258)))
"@)

Plate 'access-gate' 416 280 (@"
<path class="w1" d="M0 236H416"/>
<rect x="46" y="96" width="34" height="140" class="fd w"/><rect x="52" y="112" width="22" height="38" rx="3" class="fb g"/><path class="g1" d="M57 120h12M57 130h12M57 140h12"/><circle class="ft a-blink" cx="63" cy="164" r="5"/>
<path class="a-beam" fill="url(#c)" d="M63 84L10 236H130Z"/>
<rect x="340" y="160" width="20" height="76" class="fd w"/>
<g class="a-gate"><path class="g" stroke-width="9" stroke-dasharray="26 14" d="M80 178H338"/></g>
<rect x="150" y="110" width="110" height="126" rx="3" class="fd w"/><path class="g" d="M140 110H270L258 90H152Z"/><rect x="166" y="128" width="78" height="42" fill="#E3B85E" fill-opacity=".3" class="g1 a-glow"/>
$(Guard 300 236 1)
<path class="r" d="M0 260C100 248 200 272 300 258S400 254 416 260"/>
$(Checks @(,@(204,262)))
"@)

# ---- Industries ----
$rows = (0..8 | ForEach-Object { $x = -120 + $_*70; "<path class=`"g1`" d=`"M160 150L$x 320`"/>" }) -join ''
Plate 'agriculture' 320 320 (@"
<g class="a-glowpath"><circle cx="204" cy="66" r="24" class="fw" opacity=".9"/><circle cx="194" cy="60" r="22" fill="#1E2845"/></g>
<path class="w" d="M0 150C60 118 104 130 150 146S260 128 320 150"/>
$rows
<path class="w" d="M16 150v-34M44 142v-34M16 124h28M16 134h28"/>
<path class="r" d="M0 278C60 244 118 300 186 262S290 238 320 250"/>
$(Checks @(,@(186,262)))
"@)

Plate 'construction' 640 320 (@"
<path class="w1" d="M0 268H640"/>
<path class="w" d="M250 268V116H460V268M250 154H460M250 192H460M250 230H460M302 116V268M354 116V268M406 116V268"/>
<path class="g1" d="M250 154l52 38M302 154l52 38M354 192l52 38M406 116l54 38"/>
<path class="g" d="M130 268V34M152 268V34M130 60L152 34M152 92L130 60M130 124L152 92M152 156L130 124M130 188L152 156M152 220L130 188M130 252L152 220"/>
<path class="g" d="M70 34H440M70 34L141 8 440 34M141 8V34M90 34v22"/><rect x="62" y="56" width="50" height="26" class="fd g"/>
<g class="a-hook"><path class="w" d="M372 34V92"/><rect x="346" y="92" width="52" height="20" class="fd g"/></g>
<path class="a-flicker" fill="url(#y)" d="M560 86L470 268H640Z"/><path class="w" d="M560 76V268M544 76H576"/><circle cx="560" cy="84" r="6" class="fw"/>
<path class="w" d="M0 232H220M0 232v36M44 232v36M88 232v36M132 232v36M176 232v36M220 232v36"/>
<path class="w1" d="M0 268L44 232 88 268 132 232 176 268 220 232"/>
<path class="r" d="M0 296H640"/>
$(Checks @(@(222,296),@(482,296)))
"@)

Plate 'industrial' 320 320 (@"
<path class="w1" d="M0 268H320"/>
<path class="fd w" d="M36 268V158L92 118V158L148 118V158L204 118V268Z"/>
<path class="w" d="M224 268V70h26v198M262 268V104h22v164M220 70h34M258 104h30"/>
<path class="g1" d="M60 196h24M104 196h24M148 196h24M60 224h24M104 224h24M148 224h24"/>
<path class="w1 a-smoke" d="M238 58c-8-10 8-16 0-26M273 92c-8-10 8-16 0-26"/>
<rect x="106" y="230" width="30" height="38" fill="#E3B85E" fill-opacity=".35" class="g a-glow"/>
<path class="r" d="M0 296H320"/>
$(Checks @(,@(120,296)))
"@)

$houses = (0..2 | ForEach-Object { $x = 26 + $_*128; "<path class=`"fd w`" d=`"M$x 256V176l52-44 52 44v80z`"/><rect x=`"$($x+18)`" y=`"190`" width=`"26`" height=`"24`" fill=`"#E3B85E`" fill-opacity=`".5`" class=`"g1 a-glow`" style=`"animation-delay:$($_*400)ms`"/><rect x=`"$($x+60)`" y=`"208`" width=`"24`" height=`"48`" class=`"w1`"/>" }) -join ''
Plate 'residential' 640 320 (@"
<path class="w1" d="M0 256H640"/>
$houses
<rect x="470" y="172" width="86" height="84" rx="3" class="fd w"/><path class="g" d="M460 172h106l-14-20H474z"/><rect x="486" y="188" width="54" height="30" fill="#E3B85E" fill-opacity=".3" class="g1 a-glow"/>
<rect x="580" y="198" width="14" height="58" class="fd w"/><g class="a-gate"><path class="g" d="M556 210H636" stroke-dasharray="12 7"/></g>
<circle cx="572" cy="60" r="20" class="fw" opacity=".9"/><circle cx="564" cy="55" r="18" fill="#1B2440"/>
<path class="r" d="M0 290C160 270 320 304 470 284S620 280 640 290"/>
$(Checks @(@(188,284),@(470,284)))
"@)

$hwin = (80,126,172,218 | ForEach-Object { "<rect x=`"$_`" y=`"124`" width=`"24`" height=`"22`" class=`"w1`"/><rect x=`"$_`" y=`"164`" width=`"24`" height=`"22`" class=`"w1`"/>" }) -join ''
Plate 'healthcare' 320 320 (@"
<path class="w1" d="M0 262H320"/>
<rect x="56" y="104" width="208" height="158" class="fd w"/><rect x="118" y="60" width="84" height="44" class="fd w"/>
<path class="fg a-pulse" d="M152 68h16v10h10v14h-10v10h-16V92h-10V78h10z"/>
$hwin
<path class="g" d="M116 262V212h88v50M100 212h120"/><path class="w1" d="M160 212v50"/>
<path class="r" d="M0 294H320"/>
$(Checks @(,@(160,294)))
"@)

Plate 'government-aerospace' 480 320 (@"
<path class="w1" d="M0 268H480"/>
<g transform="translate(80 0)">
<g class="a-lift"><path class="fd w" d="M150 214V90c0-26 12-44 20-52 8 8 20 26 20 52v124z"/><path class="g" d="M150 96h40M150 184h40"/><circle cx="170" cy="130" r="10" class="fb g"/><path class="fd g" d="M150 176l-22 42 22-4zM190 176l22 42-22-4z"/><path class="g1 a-blink" d="M154 240c6 20 26 20 32 0"/></g>
<path class="w" d="M238 268V58M266 268V58M238 92l28 40M266 92l-28 40M238 172l28 40M266 172l-28 40M190 104h48M190 188h48M232 58h40"/>
</g>
<g class="a-dish"><path class="w" d="M60 268V222M36 214a30 30 0 0 0 48-22zM60 202L86 174"/></g>
<path class="r" d="M0 296H480"/>
$(Checks @(,@(250,296)))
"@)

# ---- Specialist team icons ----
Plate 'unit-coin' 306 300 (@"
<g class="a-bob"><path class="fd g" d="M78 176c0-46 32-80 75-80s75 34 75 80z"/><path class="g" d="M58 176H248c10 0 12 18 0 18H58c-12 0-10-18 0-18zM135 98v42M171 98v42"/></g>
<path class="r" d="M0 248H306"/>$(Checks @(,@(153,248)))
"@)
$leaves = (90,118,146,174 | ForEach-Object { "<path class=`"fd g`" d=`"M153 $($_+22)c-26-2-40-16-44-38 26 2 40 16 44 38zM153 $($_+22)c26-2 40-16 44-38-26 2-40 16-44 38z`"/>" }) -join ''
Plate 'unit-car' 306 300 (@"
<g class="a-bob"><path class="g" d="M153 226V76"/>
$leaves
<path class="fd g" d="M153 88c-10-12-10-30 0-44 10 14 10 32 0 44z"/></g>
<path class="r" d="M0 248H306"/>$(Checks @(,@(153,248)))
"@)

"$((Get-ChildItem $out).Count) scenes written to $out"
