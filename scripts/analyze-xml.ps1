$xmlPath = "C:\Users\hecki\Downloads\ledebativoirien.WordPress.2026-05-07.xml"
$xml = [xml](Get-Content $xmlPath -Raw -Encoding UTF8)
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("wp","http://wordpress.org/export/1.2/")

$items = $xml.SelectNodes("//item")
Write-Host "Total items: $($items.Count)"

$published = @()
foreach ($item in $items) {
    $statusNode = $item.SelectSingleNode("wp:status", $ns)
    $typeNode   = $item.SelectSingleNode("wp:post_type", $ns)
    if ($statusNode -and $typeNode -and $statusNode.InnerText -eq "publish" -and $typeNode.InnerText -eq "post") {
        $published += $item
    }
}

Write-Host "Published posts: $($published.Count)"
Write-Host ""

foreach ($item in $published) {
    $title = $item.SelectSingleNode("title").InnerText
    $slug  = $item.SelectSingleNode("wp:post_name", $ns).InnerText
    $catNodes = $item.SelectNodes("category")
    $cats = @()
    foreach ($c in $catNodes) {
        $nicename = $c.GetAttribute("nicename")
        if ($nicename) { $cats += $nicename }
    }
    Write-Host "TITLE : $title"
    Write-Host "SLUG  : $slug"
    Write-Host "CATS  : $($cats -join ', ')"
    Write-Host "---"
}
