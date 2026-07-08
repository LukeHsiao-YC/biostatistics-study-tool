/* =====================================================================
   selectors.js — 共用選擇器模組（單一資料來源）
   同時被各 Section 頁面與「選擇器專區 tools.html」載入，確保一致。
   用法：在 HTML 放 <div data-selector="design"></div>，本檔會自動掛載。
   ===================================================================== */
(function(){
'use strict';

/* ---------- 各選擇器定義 ----------
   每個 selector：
     questions: [{id,t,h,o:[[value,label,sub],...]}]
     visibility(state, show): 依作答顯示/隱藏題目（show(qid,bool)）
     recommend(state): 回傳 {title,rec,alt,why} 或 null（尚未足以建議）
*/
const SELECTORS = {

/* ===== Section 1 · 研究設計選擇器 ===== */
design:{
 label:'研究設計選擇器', pill:'Choosing a Research Design', section:'Section 1 流行病學',
 intro:'依你的研究目的與可行性，建議適當的流行病學研究設計。',
 questions:[
  {id:'purpose',t:'Q1. 你的研究目的主要是？',h:'先確定要「描述現況」還是「檢驗因果」。',
   o:[['describe','描述現況 / 產生假設','看疾病有多少、分布如何，或先找線索'],
      ['test','檢驗因果假設','想證明某暴露是否造成某疾病']]},
  {id:'assign',t:'Q2. 你能「主動分配」暴露或介入給受試者嗎？',h:'能主動隨機分配＝實驗性；只能觀察＝觀察性。',
   o:[['exp','能（可隨機分配介入）','由研究者決定誰接受介入'],
      ['obs','不能（只能觀察）','暴露是受試者本來就有的（如吸菸）']]},
  {id:'level',t:'Q3. 你的資料是「個人層級」還是「群體層級」？',h:'個人＝每人的暴露與疾病都有；群體＝只有整體比率。',
   o:[['indiv','個人層級 Individual','每位受試者的資料'],
      ['group','群體層級 Ecologic','只有國家/地區的整體數據']]},
  {id:'dir',t:'Q4. 你打算怎麼追蹤時間方向？',h:'這決定世代 vs 病例對照 vs 橫斷。',
   o:[['expfirst','從「暴露」開始往後追是否發病','先分暴露/未暴露，追蹤結果 → 世代'],
      ['disfirst','從「疾病」開始往回問暴露','先找病例與對照，回溯暴露 → 病例對照'],
      ['same','同一時間點同時測暴露與疾病','一次調查 → 橫斷']]},
  {id:'rare',t:'（補充）你的疾病或暴露屬於哪種情況？',h:'幫助在世代/病例對照間微調。',
   o:[['rd','罕見「疾病」','病例對照較有效率'],
      ['re','罕見「暴露」','世代較有效率'],
      ['na','都不算罕見 / 不確定','依上題方向即可']]}
 ],
 visibility(s,show){
  show('assign', s.purpose==='test');
  show('level', s.purpose==='describe' || (s.purpose==='test'&&s.assign==='obs'));
  const obsIndiv=(s.purpose==='describe'&&s.level==='indiv')||(s.purpose==='test'&&s.assign==='obs'&&s.level==='indiv');
  show('dir', obsIndiv);
  show('rare', obsIndiv && (s.dir==='expfirst'||s.dir==='disfirst'));
 },
 recommend(s){
  if(!s.purpose) return null;
  if(s.purpose==='test'){
   if(!s.assign) return null;
   if(s.assign==='exp') return {title:'實驗性設計（因果證據最強）',
     rec:'隨機對照試驗 Randomized Controlled Trial (RCT)',
     alt:'若在社區/健康人群測預防措施 → 田野試驗 Field trial。',
     why:'你能主動隨機分配介入，這是判斷因果最有力的設計；隨機化讓兩組在已知與未知因子上可比。 <span class="pg">Ch5 p.73–75</span>'};
  }
  if(!s.level) return null;
  if(s.level==='group') return {title:'生態研究',
    rec:'生態研究 Ecologic Study（橫斷或縱貫）',alt:null,
    why:'只用群體層級資料（如各國平均攝取量 vs 疾病率）。快速便宜、常用於產生假設，但小心生態謬誤 (ecologic fallacy)——群體關係不等於個人關係。 <span class="pg">Ch5 p.70</span>'};
  if(s.purpose==='describe' && !s.dir) return {title:'描述性/產生假設',
    rec:'橫斷調查 Cross-sectional Survey（或病例系列/質性研究）',alt:null,
    why:'個人層級、想描述現況或找線索：橫斷調查可得盛行率；少數個案用病例報告/系列；深入探索用質性研究。 <span class="pg">Ch5 p.69</span>'};
  if(!s.dir) return null;
  if(s.dir==='same') return {title:'橫斷研究',
    rec:'橫斷研究 Cross-sectional Study',alt:null,
    why:'同一時間點同時測「暴露」與「疾病」，可得盛行率。缺點：無法判斷誰先誰後（因果方向不明）。 <span class="pg">Ch5 p.69–70</span>'};
  if(s.dir==='expfirst'){const t=s.rare==='rd'?'（提醒：疾病罕見時世代較不划算，可考慮病例對照）':'';
   return {title:'世代研究',rec:'世代研究 Cohort Study（前瞻或回溯）',
     alt:'適合「罕見暴露」與需要發生率、時序性的研究；可直接算相對風險 RR。'+t,
     why:'先依暴露/未暴露分組，往後追蹤誰發病。優點：能確立時序、算發生率與 RR；缺點：耗時、費用高，罕見病需極大樣本。 <span class="pg">Ch5 p.70–72</span>'};}
  if(s.dir==='disfirst'){const t=s.rare==='re'?'（提醒：暴露罕見時病例對照較不利，可考慮世代）':'';
   return {title:'病例對照研究',rec:'病例對照研究 Case-Control Study',
     alt:'特別適合「罕見疾病」、省時省錢；結果以勝算比 OR 表示。'+t,
     why:'先找病例與對照，回溯比較暴露史。優點：快、便宜、適合罕見病與長潛伏期疾病；缺點：易有回憶偏差、不能直接算發生率。經典例：DES 與陰道腺癌。 <span class="pg">Ch5 p.72–73</span>'};}
  return null;
 }
},

/* ===== Section 1 · 測量指標選擇器 ===== */
measure:{
 label:'測量指標選擇器', pill:'Choosing an Epidemiologic Measure', section:'Section 1 流行病學',
 intro:'你想「量化什麼」？建議該用哪個流行病學指標並說明白話意義與公式。',
 questions:[
  {id:'goal',t:'Q1. 你想「量化」什麼？',h:'先選大方向。',
   o:[['freq','疾病發生的頻率','有多少人得病'],
      ['compare','比較兩組的風險','暴露 vs 未暴露誰風險高'],
      ['benefit','介入/治療的效益','治療能減少多少壞結果'],
      ['test','診斷檢驗的表現','這個檢驗準不準'],
      ['agree','兩位判讀者的一致性','兩人判讀有多一致']]},
  {id:'freqtype',t:'Q2. 頻率：關心「新發生」還是「當下總量」？',h:'',
   o:[['new','新發生的病例（有追蹤時間）','一段期間內新診斷'],
      ['exist','某時點所有病例（新+舊）','此刻有多少人有病']]},
  {id:'comptype',t:'Q2. 比較：你要哪一種比較？',h:'',
   o:[['rel','相對比較（幾倍）','風險是幾倍'],
      ['abs','絕對差異（差多少）','風險相差多少個百分點'],
      ['pop','族群層級可預防比例','整個族群能少掉多少疾病']]},
  {id:'design',t:'Q3. 相對比較：你的研究設計是？',h:'設計決定用 RR 還是 OR。',
   o:[['cohort','世代 / RCT','從暴露追到疾病'],
      ['cc','病例對照','從疾病回推暴露']]},
  {id:'testtype',t:'Q2. 檢驗表現：你最在意哪一面？',h:'',
   o:[['se','抓出病人／排除疾病的能力','敏感度 / 特異度'],
      ['ppv','驗陽性後真的有病的機率','預測值 PPV / NPV（受盛行率影響）'],
      ['lr','不受盛行率影響的整體效能','概似比 LR / ROC 曲線']]}
 ],
 visibility(s,show){
  show('freqtype', s.goal==='freq');
  show('comptype', s.goal==='compare');
  show('design', s.goal==='compare'&&s.comptype==='rel');
  show('testtype', s.goal==='test');
 },
 recommend(s){
  if(!s.goal) return null;
  if(s.goal==='freq'){
   if(!s.freqtype) return null;
   if(s.freqtype==='new') return {title:'發生（新病例）',
     rec:'發生率 Incidence（累積發生率 / 發生密度 Incidence density）',
     alt:'有人時 (person-time) 資料時用發生密度（率）。',
     why:'一段期間內「新」病例數 ÷ 期初風險人口（或人時）。反映「變成病人的速度」，是病因與風險研究的核心。 <span class="pg">Ch2 p.17, 23</span>'};
   return {title:'盛行（當下總量）',rec:'盛行率 Prevalence（點盛行率 / 期間盛行率）',alt:null,
     why:'某時點所有（新+舊）病例 ÷ 總人口。反映「疾病負擔」，適合規劃醫療資源。關係式：盛行率 ≈ 發生率 × 病程。 <span class="pg">Ch2 p.17–19</span>'};
  }
  if(s.goal==='compare'){
   if(!s.comptype) return null;
   if(s.comptype==='rel'){
    if(!s.design) return null;
    if(s.design==='cohort') return {title:'相對比較（世代/RCT）',rec:'相對風險 Relative Risk / Risk Ratio (RR)',
      alt:'RR = 暴露組風險 ÷ 未暴露組風險。',
      why:'RR=1 代表無差異；RR>1 代表暴露組風險較高。需直接算「風險」，故用於世代/RCT。 <span class="pg">Ch6 p.85</span>'};
    return {title:'相對比較（病例對照）',rec:'勝算比 Odds Ratio (OR)',alt:'OR = ad ÷ bc（2×2 表）。',
      why:'病例對照研究無法直接算風險，改用勝算比；疾病罕見時 OR 近似 RR。 <span class="pg">Ch6 p.86</span>'};
   }
   if(s.comptype==='abs') return {title:'絕對差異',rec:'歸因風險 Attributable Risk (AR) / 風險差',alt:null,
     why:'AR = 暴露組風險 − 未暴露組風險，代表「暴露多造成的絕對超額風險」，用於評估暴露對個人的實際衝擊。 <span class="pg">Ch6 p.84, 87</span>'};
   return {title:'族群層級',rec:'族群歸因風險 Population Attributable Risk (PAR / PAR%)',alt:null,
     why:'若移除該暴露，整個族群可減少多少疾病。取決於「風險比」與「暴露盛行率」——常見暴露即使 RR 不大，PAR 也可能很高。 <span class="pg">Ch6 p.88</span>'};
  }
  if(s.goal==='benefit') return {title:'介入效益',
    rec:'ARR（絕對風險下降）、RRR（相對風險下降）、NNT（益一需治數）',alt:'NNT = 1 ÷ ARR；越小代表越有效。',
    why:'ARR＝對照組風險−治療組風險；RRR＝ARR÷對照組風險。例：療法使 1/3 難治潰瘍癒合，ARR=0.333 → NNT=3。 <span class="pg">Ch6 p.90–92</span>'};
  if(s.goal==='test'){
   if(!s.testtype) return null;
   if(s.testtype==='se') return {title:'檢驗表現：抓病/排除',rec:'敏感度 Sensitivity / 特異度 Specificity',alt:null,
     why:'敏感度＝有病者中被驗出陽性的比例（高→適合篩檢、排除疾病）；特異度＝健康者中被驗出陰性的比例（高→適合確診）。 <span class="pg">Ch7 p.101</span>'};
   if(s.testtype==='ppv') return {title:'檢驗表現：預測值',rec:'陽性預測值 PPV / 陰性預測值 NPV',alt:null,
     why:'PPV＝驗陽者中真的有病的比例，強烈受「盛行率」影響——盛行率低時 PPV 會偏低。 <span class="pg">Ch7 p.102</span>'};
   return {title:'檢驗表現：整體效能',rec:'概似比 Likelihood Ratio (LR) / ROC 曲線',alt:null,
     why:'LR 由敏感度與特異度組成、不受盛行率影響，適合比較檢驗整體效能；ROC 曲線協助選最佳切點 (cutoff)。 <span class="pg">Ch7 p.103–105</span>'};
  }
  if(s.goal==='agree') return {title:'判讀一致性',rec:'Kappa (κ) 一致性檢定',alt:null,
    why:'Kappa 衡量「扣掉純靠運氣的一致」後，兩位觀察者真正的一致程度。0＝只和運氣一樣，1＝完全一致。 <span class="pg">Ch7 p.107</span>'};
  return null;
 }
},

/* ===== Section 2 · 統計方法選擇器 ===== */
stat:{
 label:'統計方法選擇器', pill:'Choosing an Appropriate Statistical Test', section:'Section 2 生物統計',
 intro:'依你的資料型態與研究設計，建議適當的統計方法（課本 Table 10.1 / 11.1）。',
 questions:[
  {id:'nIV',t:'Q1. 你想分析幾個「自變項 / 預測變項 (independent variable)」？',
   h:'自變項＝可能造成影響的因素（如治療組別）；結果變項＝你關心的產出（如血壓）。',
   o:[['1','只有 1 個自變項','雙變項分析 Bivariate（第10章）'],
      ['many','2 個以上自變項','多變項分析 Multivariable（第11章）']]},
  {id:'dv',t:'Q2. 你的「結果變項 (outcome variable)」是哪一種資料型態？',h:'這是決定方法最關鍵的一步。',
   o:[['cont','連續 Continuous','血壓、體重、血糖'],
      ['ord','順序 Ordinal','很滿意/普通/不滿意'],
      ['dich','二分/名目 Dichotomous/Nominal','存活vs死亡、有病vs無病、種族'],
      ['tte','存活/時間到事件 Time-to-event','存活時間、復發時間']]},
  {id:'iv',t:'Q3. 你的「自變項 / 分組」是哪一種？',h:'',
   o:[['cont','連續 Continuous','身高、年齡、劑量'],
      ['two','2 組類別 Two groups','治療組 vs 對照組'],
      ['multi','3 組以上 ≥3 groups','A藥/B藥/安慰劑']]},
  {id:'paired',t:'Q4. 兩組之間是「獨立」還是「配對 / 前後測」？',
   h:'同一批人測兩次或配對＝paired；不同的獨立受試者＝independent。',
   o:[['indep','獨立樣本 Independent','兩組是不同的人'],
      ['paired','配對/前後測 Paired','同一批人測兩次或配對']]},
  {id:'param',t:'Q5. 是否符合常態等假設，可用參數方法？',
   h:'近常態、樣本大→參數；偏斜、樣本小、順序資料→無母數。',
   o:[['para','符合（參數 Parametric）','資料近常態、樣本較大'],
      ['nonpara','不確定/不符合（無母數 Nonparametric）','偏斜、樣本小、較保守']]}
 ],
 visibility(s,show){
  const multi=s.nIV==='many';
  show('iv', !multi && s.dv && s.dv!=='tte');
  show('paired', !multi && s.iv==='two' && (s.dv==='cont'||s.dv==='dich'));
  show('param', !multi && s.dv==='cont' && (s.iv==='two'||s.iv==='multi'));
 },
 recommend(s){
  if(!s.nIV||!s.dv) return null;
  // 多變項
  if(s.nIV==='many'){
   if(s.dv==='cont') return {title:'多變項分析（連續結果）',rec:'多元線性迴歸 Multiple Linear Regression',
     alt:'自變項全為類別 → ANOVA；連續與類別混合 → 共變數分析 ANCOVA。',
     why:'≥2 個自變項且結果為連續時，用一般線性模式家族，可同時校正干擾因子。原則：每個自變項至少 10 筆觀測。 <span class="pg">p.174–176</span>'};
   if(s.dv==='dich') return {title:'多變項分析（二分結果）',rec:'多元邏輯斯迴歸 Multiple Logistic Regression',
     alt:'輸出勝算比 (odds ratio)。',
     why:'結果是「是/否」型且要校正多個因子時使用，臨床預測模型常用。 <span class="pg">p.179–180</span>'};
   if(s.dv==='tte') return {title:'多變項分析（存活）',rec:'Cox 比例風險模式 Cox Proportional Hazards',
     alt:'可處理追蹤中失聯與設限資料。',
     why:'結果是時間相關的二分事件（存活/死亡且在意時間）時使用，輸出風險比。 <span class="pg">p.166, 180</span>'};
   if(s.dv==='ord') return {title:'多變項分析（順序結果）',rec:'順序邏輯斯迴歸 Ordinal Logistic Regression',
     alt:'或視情況重新編碼後採一般線性模式家族。',
     why:'核心概念與其他多變項法相同——同時納入多個自變項並校正彼此影響。 <span class="pg">p.174 Table 11.1</span>'};
  }
  // 雙變項
  if(s.dv==='tte') return {title:'存活分析（雙變項）',rec:'Kaplan-Meier 存活曲線 + Log-rank 檢定',
    alt:'亦可用生命表分析或人時法；需校正多因子時改用 Cox。',
    why:'結果是「多久後發生事件」（存活、復發）並比較兩組時使用。 <span class="pg">p.164–167</span>'};
  if(s.dv==='dich'){
   if(!s.iv) return null;
   if(s.iv==='two'){
    if(!s.paired) return null;
    if(s.paired==='paired') return {title:'類別資料（配對 2×2）',rec:'McNemar 檢定 McNemar Test',
      alt:'配對且格內數字很小可用精確版 McNemar / 二項檢定。',
      why:'2×2 表且為配對／前後測資料（同一批人前後比較，或一對一配對）時使用，專門比較「前後改變方向不一致」的兩格。 <span class="pg">p.159</span>'};
    return {title:'類別資料（獨立 2 組）',rec:'卡方獨立性檢定 Chi-square Test of Independence',
      alt:'任一格期望次數 <5 → 改用 Fisher 精確檢定；比較兩比例亦可用 z 檢定。',
      why:'兩個獨立組別的類別結果（如治療組 vs 對照組的發病比例），比較「觀察 vs 期望次數」。 <span class="pg">p.156–160</span>'};
   }
   return {title:'類別資料（多組／一般）',rec:'卡方獨立性檢定（R×C 列聯表）',
     alt:'小樣本用 Fisher 精確檢定；配對資料用 McNemar。',
     why:'結果與自變項皆為類別時，用列聯表與卡方檢定判斷是否關聯。 <span class="pg">p.156–160</span>'};
  }
  if(s.dv==='ord'){
   if(s.iv==='cont') return {title:'順序資料（相關）',rec:'Spearman 或 Kendall 等級相關係數',alt:null,
     why:'兩變項中有順序型資料、或不符常態時，用等級為基礎的無母數相關。 <span class="pg">p.155</span>'};
   if(s.iv==='multi') return {title:'順序資料（≥3 組）',rec:'Kruskal-Wallis 檢定',alt:null,
     why:'比較 3 組以上、結果為順序或非常態的無母數方法（無母數版 ANOVA）。 <span class="pg">p.155</span>'};
   return {title:'順序資料（2 組）',
     rec:(s.paired==='paired'?'Wilcoxon 配對符號等級檢定':'Mann-Whitney U 檢定'),alt:null,
     why:'順序型/非常態資料比較兩組的無母數方法。配對用 Wilcoxon signed-ranks；獨立用 Mann-Whitney U。 <span class="pg">p.154</span>'};
  }
  if(s.dv==='cont'){
   if(!s.iv) return null;
   if(s.iv==='cont') return {title:'連續 vs 連續',rec:'Pearson 相關係數 + 簡單線性迴歸',
     alt:'相關係數 r 看關聯強度與方向；迴歸看 x 每變動一單位、y 平均變動多少。',
     why:'兩個連續變項的關係（如身高與體重）。先畫聯合分布圖檢查是否為直線，再算 r 與 R²。 <span class="pg">p.151–153</span>'};
   const nonpara=s.param==='nonpara';
   if(s.iv==='multi') return {title:'連續結果 · ≥3 組比較',
     rec:nonpara?'Kruskal-Wallis 檢定（無母數）':'單因子變異數分析 One-way ANOVA',
     alt:nonpara?'資料近常態可改用 ANOVA。':'資料偏斜/樣本小 → 改用 Kruskal-Wallis。',
     why:'比較 3 組以上的平均值。ANOVA 用 F 比值比較「組間變異」與「組內變異」。 <span class="pg">p.142, 176</span>'};
   if(s.paired==='paired') return {title:'連續結果 · 2 組配對/前後',
     rec:nonpara?'Wilcoxon 配對符號等級檢定（無母數）':'配對 t 檢定 Paired t-test',
     alt:nonpara?'資料近常態可改用配對 t 檢定。':'資料偏斜/樣本小 → 改用 Wilcoxon signed-ranks。',
     why:'同一批人前後測或配對比較連續結果（如治療前後血壓）。配對設計移除個體差異，檢定力較高。 <span class="pg">p.140, 154</span>'};
   return {title:'連續結果 · 2 組獨立',
     rec:nonpara?'Mann-Whitney U 檢定（無母數）':'兩樣本 t 檢定 Two-sample t-test',
     alt:nonpara?'資料近常態可改用兩樣本 t 檢定。':'資料偏斜/樣本小 → 改用 Mann-Whitney U。',
     why:'比較兩個獨立組別的平均值（如治療組 vs 對照組）。t 檢定＝觀察差異 ÷ 差異的標準誤。 <span class="pg">p.136–140</span>'};
  }
  return null;
 }
},

/* ===== Section 3 · 預防策略選擇器 ===== */
prevention:{
 label:'預防策略選擇器', pill:'Choosing a Prevention Strategy', section:'Section 3 預防醫學',
 intro:'依疾病在自然史中的階段，建議屬於初段／次段／三段預防及具體方法。',
 questions:[
  {id:'stage',t:'Q1. 這位對象目前處於疾病自然史的哪個階段？',h:'預防的層級取決於「疾病走到哪一步」。',
   o:[['well','尚未發病（健康或只有危險因子）','還沒有疾病過程'],
      ['presymp','已有疾病過程但「還沒症狀」','可被篩檢早期偵測（如無症狀高膽固醇、原位癌）'],
      ['symp','已出現「症狀」、已確診','疾病已臨床顯現']]},
  {id:'pmethod',t:'Q2. 初段預防：你的手段偏向？',h:'',
   o:[['promo','一般健康促進','衛教、健康飲食、運動、戒菸、壓力管理'],
      ['protect','特定保護 Specific protection','疫苗接種、化學預防（高風險者低劑量阿斯匹靈）、危險因子藥物']]},
  {id:'tstage',t:'Q2. 三段預防：疾病屬早期還是晚期症狀？',h:'',
   o:[['early','早期症狀','目標＝失能限制 disability limitation'],
      ['late','晚期症狀 / 已失能','目標＝復健 rehabilitation']]}
 ],
 visibility(s,show){ show('pmethod', s.stage==='well'); show('tstage', s.stage==='symp'); },
 recommend(s){
  if(!s.stage) return null;
  if(s.stage==='well'){
   if(!s.pmethod) return null;
   if(s.pmethod==='promo') return {title:'初段預防 · 健康促進',rec:'Primary Prevention — 一般健康促進 Health Promotion',
     alt:'戒菸、健康飲食、規律運動、壓力管理、體重控制。',
     why:'在疾病「發生之前」就降低危險因子，針對一般大眾、非特定疾病。 <span class="pg">Ch14–15 p.213, 222</span>'};
   return {title:'初段預防 · 特定保護',rec:'Primary Prevention — 特定保護 Specific Protection',
     alt:'疫苗接種、化學預防（高風險者低劑量阿斯匹靈）、危險因子藥物（降血壓、降血脂）。',
     why:'針對「特定疾病」在發生前提供保護，如免疫接種、化學預防。 <span class="pg">Ch15 p.222–231</span>'};
  }
  if(s.stage==='presymp') return {title:'次段預防 · 篩檢與早期偵測',
    rec:'Secondary Prevention — 篩檢 Screening / 早期偵測',
    alt:'在「還沒症狀」時攔截疾病，如子宮頸抹片、高血壓/高膽固醇篩檢。建議搭配「篩檢適當性檢核」評估是否值得推行。',
    why:'次段預防的前提是體內已有疾病過程但尚未出現症狀，目標是及早發現、及早治療。 <span class="pg">Ch16 p.237</span>'};
  if(!s.tstage) return null;
  if(s.tstage==='early') return {title:'三段預防 · 失能限制',rec:'Tertiary Prevention — 失能限制 Disability Limitation',
    alt:'早期症狀病人：積極治療以阻止惡化、避免併發症與失能。',
    why:'疾病已出現症狀；早期症狀階段目標是限制失能（如心肌梗塞後的急性處置）。 <span class="pg">Ch17 p.250</span>'};
  return {title:'三段預防 · 復健',rec:'Tertiary Prevention — 復健 Rehabilitation',
    alt:'晚期/已失能病人：復健以恢復功能、提升生活品質、重返社會。',
    why:'晚期症狀或已失能階段，目標是復健、恢復最大功能。 <span class="pg">Ch17 p.250–256</span>'};
 }
},

/* ===== Section 3 · 篩檢適當性檢核 ===== */
screening:{
 label:'篩檢適當性檢核', pill:'Screening Appropriateness', section:'Section 3 預防醫學',
 intro:'依課本三大最低要求（疾病、檢驗、醫療體系）快速檢核某疾病是否適合族群篩檢。',
 questions:[
  {id:'disease',t:'① 疾病條件 Disease requirements',h:'疾病夠嚴重、盛行率足夠、有「可偵測的臨床前期 (detectable preclinical phase)」、且早期治療比晚期有效？（比喻：真的有火災風險）',
   o:[['yes','大致符合','嚴重且早治有效、有可篩檢的無症狀期'],
      ['no','不符合','太罕見/太輕微，或早治沒有比較好']]},
  {id:'test',t:'② 檢驗條件 Screening test requirements',h:'檢驗夠敏感與特異、安全、民眾可接受、成本合理？（比喻：煙霧偵測器要對真火反應、不亂叫）',
   o:[['yes','大致符合','夠準、安全、可接受、便宜'],
      ['no','不符合','太多偽陽/偽陰、危險、昂貴或難接受']]},
  {id:'system',t:'③ 醫療體系條件 Health care system requirements',h:'篩檢陽性者有後續確診與治療的資源、可近性與可負擔性？（比喻：警報響了要有人來滅火）',
   o:[['yes','大致符合','有完整後續診療與轉介'],
      ['no','不符合','驗出來卻沒有後續資源']]}
 ],
 visibility(s,show){},
 recommend(s){
  const cats={disease:'疾病條件',test:'檢驗條件',system:'醫療體系條件'};
  const fails=Object.keys(cats).filter(k=>s[k]==='no');
  const yeses=Object.keys(cats).filter(k=>s[k]==='yes');
  if(fails.length) return {title:'不建議大規模族群篩檢',
    rec:'未達最低要求：'+fails.map(k=>cats[k]).join('、'),
    alt:'三大要求任一項未至少部分符合，大規模篩檢就可能不恰當。',
    why:'課本以火災比喻：疾病＝是否真有火、檢驗＝煙霧偵測器準不準、體系＝警報後有沒有人來滅火，三者缺一不可。判讀成效時也要小心前導時間偏差 (lead-time bias)、長度偏差 (length bias) 與選擇偏差。 <span class="pg">Ch16 p.237–240</span>'};
  if(yeses.length===3) return {title:'適合考慮推行族群篩檢',
    rec:'三大最低要求皆大致符合 ✓',
    alt:'仍需評估效益與傷害、倫理、重複篩檢頻率，並注意偏差對成效評估的影響。',
    why:'疾病、檢驗、醫療體系三大要求皆符合。仍要注意：前導時間偏差（看似延長存活其實只是提早診斷）、長度偏差（篩檢偏向抓到進展較慢的病例）。 <span class="pg">Ch16 p.237–241</span>'};
  return null;
 }
},

/* ===== Section 4 · 公共衛生行動導覽 ===== */
navigator:{
 label:'公共衛生行動導覽', pill:'Public Health Action Navigator', section:'Section 4 公共衛生',
 intro:'依你面對的公衛情境，導引到對應的核心功能／架構與章節。',
 questions:[
  {id:'cat',t:'Q1. 你面對的是哪一類公共衛生情境？',h:'先選最接近的大方向。',
   o:[['assess','了解／評估一個族群的健康狀況','想知道族群有多健康、主要健康問題是什麼'],
      ['policy','制定政策或確保服務被提供','政策倡議、法規、確保必要服務到位'],
      ['community','在社區推動健康改變或計畫','設計社區健康促進方案'],
      ['disaster','災難或緊急事件的應變','天災、疫情、重大事故'],
      ['quality','醫療服務的品質與組織','評估或改善照護品質'],
      ['finance','醫療政策與財源／給付','保險、給付、成本、國際比較'],
      ['onehealth','人、動物、環境健康的整合','跨領域的整體健康']]},
  {id:'phase',t:'Q2. 災難處於哪個階段？',h:'災難管理四階段。',
   o:[['mitigation','減災 Mitigation','事前降低風險與脆弱度'],
      ['preparedness','整備 Preparedness','演練、計畫、資源預備'],
      ['response','應變 Response','事件當下的緊急處置與監測'],
      ['recovery','復原 Recovery','事後重建與長期健康追蹤']]},
  {id:'measure',t:'Q2. 你想用哪個面向評估族群健康？',h:'',
   o:[['mortality','死亡與疾病負擔','主要死因、死亡率'],
      ['actual','實際死因 Actual causes','背後的行為/暴露（如吸菸、飲食、活動）'],
      ['daly','失能校正生命年 DALY','兼顧死亡與失能的綜合指標'],
      ['disparity','健康差異 Disparities','不同族群間的健康不平等']]}
 ],
 visibility(s,show){ show('phase', s.cat==='disaster'); show('measure', s.cat==='assess'); },
 recommend(s){
  if(!s.cat) return null;
  if(s.cat==='assess'){
   if(!s.measure) return null;
   const m={
    mortality:['主要死因與死亡率','用死亡證明、生命統計等監測資料看族群主要死因與疾病負擔。 <span class="pg">Ch24 p.337, 342</span>'],
    actual:['實際死因 Actual Causes of Death','看「背後的行為與暴露」——如菸草、飲食與活動——而非只看死亡證明上的疾病診斷（McGinnis & Foege）。 <span class="pg">Ch24 p.338</span>'],
    daly:['失能校正生命年 DALY','同時計入「早逝」與「失能」的綜合健康指標，用於比較疾病負擔。 <span class="pg">Ch24 p.338</span>'],
    disparity:['健康差異 Health Disparities','比較不同社經/族群間的健康不平等，指認需優先介入的族群。 <span class="pg">Ch24 p.339</span>']
   }[s.measure];
   return {title:'公衛核心功能一：評估 Assessment',rec:m[0],
     alt:'屬三大核心功能中的「評估」：系統性收集、分析並公開族群健康資料。',why:m[1]};
  }
  if(s.cat==='policy') return {title:'公衛核心功能二/三：政策制定與確保',
    rec:'Policy Development & Assurance ＋ 10 項基本公衛服務',
    alt:'政策制定＝以科學證據形成公衛政策；確保＝運用職權與資源確保必要服務被提供（未必親自提供）。',
    why:'三大核心功能為評估、政策制定、確保 (assessment, policy development, assurance)，並以「10 項基本公共衛生服務」具體落實。 <span class="pg">Ch24 p.353 · Ch25 Box 25.1</span>'};
  if(s.cat==='community') return {title:'社區健康改變',
    rec:'社區改變理論 + 健康促進計畫步驟',
    alt:'常用理論：社會認知理論、社區組織理論、創新擴散理論、社會行銷；並以健康公平為目標。',
    why:'在社區推動改變時，先選合適的行為/社區改變理論，再依步驟（定義策略、組隊、評估需求、執行、評價）設計方案。 <span class="pg">Ch26 p.369–374</span>'};
  if(s.cat==='disaster'){
   if(!s.phase) return null;
   const p={
    mitigation:['減災 Mitigation','事前降低風險與脆弱度（如建築規範、土地使用、風險評估）。'],
    preparedness:['整備 Preparedness','演練、應變計畫、人力物資與監測系統的預先準備。'],
    response:['應變 Response','事件當下的緊急醫療、快速需求評估與疾病監測（如世貿中心健康登錄）。'],
    recovery:['復原 Recovery','事後重建與受影響者的長期身心健康追蹤。']
   }[s.phase];
   return {title:'災難流行病學 · '+p[0],rec:'災難管理階段：'+p[0],
     alt:'災難管理四階段：減災 → 整備 → 應變 → 復原。',
     why:p[1]+' 災難流行病學以描述與分析流病量化衝擊並指引資源。 <span class="pg">Ch27 p.384–385</span>'};
  }
  if(s.cat==='quality') return {title:'醫療照護品質與組織',
    rec:'Donabedian 結構–過程–結果 ＋ IOM 六大目標 ＋ 三重目標',
    alt:'Donabedian：以結構(structure)、過程(process)、結果(outcome)評估品質；IOM 六大目標：安全、有效、以病人為中心、及時、有效率、公平。',
    why:'品質改善以 Donabedian 架構評估，追求 IOM 六大目標；三重目標 (Triple Aim)＝照護體驗、族群健康、照護成本。 <span class="pg">Ch28 p.392, 401</span>'};
  if(s.cat==='finance') return {title:'醫療政策與財源',
    rec:'給付者與政策：Medicare / Medicaid、需求與供給、國際比較',
    alt:'Medicare＝聯邦、主要給老年與身心障礙者；Medicaid＝聯邦與州合辦、給低收入者。',
    why:'健康政策關注需要(need)與需求(demand)、財源與給付制度，並常以國際比較檢視成效與成本。 <span class="pg">Ch29 p.408–410</span>'};
  return {title:'One Health 一體健康',rec:'整合人、動物、環境健康',
    alt:'許多威脅（如新興人畜共通傳染病、環境變遷）需跨領域協作。',
    why:'One Health 強調人類、動物與環境健康彼此相依，需整合流行病學、生統、預防醫學與公衛一起行動。 <span class="pg">Ch30 p.349, 423</span>'};
 }
}

}; // end SELECTORS

/* ---------- 通用掛載引擎 ---------- */
const EMPTY='👆 從上方開始作答，我會即時建議適當的選擇。';

function mountSelector(key, host){
  const def = SELECTORS[key];
  if(!def){ host.innerHTML='<div class="result empty">（此選擇器尚在準備中）</div>'; return; }
  const state={};
  const wiz=document.createElement('div');
  wiz.innerHTML=def.questions.map(q=>
    `<div class="q-block" data-qid="${q.id}"><h3>${q.t}</h3>${q.h?`<p class="hint">${q.h}</p>`:''}
     <div class="opts">${q.o.map(o=>`<button data-v="${o[0]}">${o[1]}<small>${o[2]||''}</small></button>`).join('')}</div></div>`).join('');
  const rec=document.createElement('div');
  rec.className='result empty'; rec.innerHTML=EMPTY;
  const reset=document.createElement('button');
  reset.className='reset'; reset.textContent='↺ 重新選擇';

  host.innerHTML=''; host.appendChild(wiz); host.appendChild(rec); host.appendChild(reset);

  function show(qid,on){const b=wiz.querySelector(`[data-qid="${qid}"]`); if(b)b.style.display=on?'':'none';}
  function applyVis(){ if(def.visibility) def.visibility(state, show); }
  function render(){
    const r=def.recommend(state);
    if(!r) return; // 尚不足以建議：保留先前結果
    rec.className='result';
    rec.innerHTML=`<h3>✅ ${r.title}</h3><div class="rec">${r.rec}</div>`+
      (r.alt?`<div class="alt">${r.alt}</div>`:'')+`<div class="why">${r.why}</div>`;
  }
  wiz.querySelectorAll('.q-block').forEach(qb=>{
    qb.querySelector('.opts').addEventListener('click',e=>{
      const b=e.target.closest('button'); if(!b)return;
      qb.querySelectorAll('button').forEach(x=>x.classList.remove('sel'));
      b.classList.add('sel'); state[qb.dataset.qid]=b.dataset.v; applyVis(); render();
    });
  });
  reset.addEventListener('click',()=>{
    for(const k in state) delete state[k];
    wiz.querySelectorAll('button').forEach(b=>b.classList.remove('sel'));
    rec.className='result empty'; rec.innerHTML=EMPTY; applyVis();
  });
  applyVis();
}

function init(){ document.querySelectorAll('[data-selector]').forEach(el=>mountSelector(el.dataset.selector, el)); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();

/* 對外暴露（tools.html 需要 metadata 來產生標題） */
window.SELECTORS=SELECTORS;
window.mountSelector=mountSelector;
})();
