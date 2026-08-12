$path = "t:\f2-projects\lendgrid-mobile\F2_Fintech_Loan_Document_Checklist_Guide.docx"
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($path)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$xmlDoc = New-Object System.Xml.XmlDocument
$xmlDoc.LoadXml($xml)
$nsmgr = New-Object System.Xml.XmlNamespaceManager($xmlDoc.NameTable)
$nsmgr.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
$nodes = $xmlDoc.SelectNodes("//w:t", $nsmgr)
$text = ""
foreach ($node in $nodes) {
    $text += $node.InnerText + " "
}
Write-Output $text
