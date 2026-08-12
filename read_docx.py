import zipfile
import xml.etree.ElementTree as ET
import sys

def extract_text_from_docx(docx_path):
    with zipfile.ZipFile(docx_path, 'r') as docx:
        xml_content = docx.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        text = []
        for p in tree.findall('.//w:p', namespaces):
            p_text = []
            for r in p.findall('.//w:r', namespaces):
                t = r.find('.//w:t', namespaces)
                if t is not None and t.text:
                    p_text.append(t.text)
            if p_text:
                text.append(''.join(p_text))
        return '\n'.join(text)

if __name__ == '__main__':
    print(extract_text_from_docx(sys.argv[1]))
