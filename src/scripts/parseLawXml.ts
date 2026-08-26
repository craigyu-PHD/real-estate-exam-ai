import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';

// 台灣政府開放資料：全國法規資料庫 (ChLaw.xml)
// 包含 <法規> 標籤，內含 <法規名稱>, <最新異動日期>, <法規條文> (內含多個 <條文內容>) 等

export interface LawData {
  name: string;
  category: string;
  versionDate: string;
  articles: ArticleData[];
}

export interface ArticleData {
  chapter: string; // 若沒有章節則為空
  articleNumber: string;
  articleText: string;
}

export async function parseLawXmlFile(filePath: string): Promise<LawData[]> {
  const xmlData = fs.readFileSync(filePath, 'utf8');
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
  });
  
  const result = parser.parse(xmlData);
  
  // 以下邏輯需根據真實的 ChLaw.xml 結構調整
  // 假設架構為: { 法規資料庫: { 法規: [ { 法規名稱: "...", 最新異動日期: "...", 法規條文: { 條文內容: [...] } } ] } }
  const laws = result?.法規資料庫?.法規 || [];
  const parsedLaws: LawData[] = [];
  
  const lawArray = Array.isArray(laws) ? laws : [laws];
  
  for (const law of lawArray) {
    const name = law.法規名稱;
    const versionDate = law.最新異動日期;
    const category = law.法規類別 || '未分類';
    
    const articles: ArticleData[] = [];
    const rawArticles = law.法規條文?.條文內容;
    
    if (rawArticles) {
        const articleArray = Array.isArray(rawArticles) ? rawArticles : [rawArticles];
        for (const art of articleArray) {
            // 解析條文號與內容 (例如: 第 1 條 xxxxxx)
            // 實際欄位名視 xml 決定，此為示意
            const text = art.條文內容 || art; 
            articles.push({
                chapter: '', // 需從編章節架構推算
                articleNumber: '0', // 需解析
                articleText: typeof text === 'string' ? text : JSON.stringify(text)
            });
        }
    }
    
    parsedLaws.push({
        name,
        category,
        versionDate,
        articles
    });
  }
  
  return parsedLaws;
}

// 如果作為 CLI 執行：
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    parseLawXmlFile(args[0]).then(res => {
      console.log(`Parsed ${res.length} laws.`);
      if (res.length > 0) {
          console.log(`First law: ${res[0].name}, ${res[0].articles.length} articles.`);
      }
    }).catch(console.error);
  }
}
