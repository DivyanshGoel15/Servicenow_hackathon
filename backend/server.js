/**
 * OneRoute — Backend Integration Server
 * Serves frontend client files from ../client and exposes the NLP Triage API
 * 
 * Zero external dependencies: uses built-in Node.js modules.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { analyzeStudentNeeds } = require('./triageService.js');

const PORT = process.env.PORT || 3000;
const CLIENT_DIR = path.resolve(__dirname, '../client');

// In-memory cases and analyses stores initialized with balanced Low, Medium & High demo cases
let casesStore = [
  {id:'STU-10486',studentId:'2310482',need:'Wellbeing + Academic',priority:'High',status:'New',serviceIds:['counselling','academic-support'],createdAt:'2026-10-05T10:30:00Z',request:"I've been feeling completely overwhelmed with coursework deadlines. I've missed multiple classes, my attendance is slipping, and I don't know who to speak with.",triageSummary:'Compound wellbeing distress directly impacting lecture attendance and impending submission deadlines.',confidence:95,channel:'Student Portal'},
  {id:'STU-10485',studentId:'2209117',need:'Academic Support',priority:'Medium',status:'Assigned',serviceIds:['academic-support'],createdAt:'2026-10-05T09:45:00Z',request:"I had an unexpected family emergency last Thursday and could not submit my econometrics assignment on time. Can I request mitigating circumstances?",triageSummary:'Coursework submission elapsed following family emergency. Mitigating circumstances application required.',confidence:96,channel:'Web form'},
  {id:'STU-10484',studentId:'2101874',need:'Careers Guidance',priority:'Low',status:'In Progress',serviceIds:['careers'],createdAt:'2026-10-05T09:10:00Z',request:"Could an advisor review my CV and statement for graduate data science schemes opening next month?",triageSummary:'Standard CV review and statement feedback for upcoming graduate schemes.',confidence:98,channel:'Web form'},
  {id:'STU-10483',studentId:'2308390',need:'Financial Hardship',priority:'High',status:'In Progress',serviceIds:['financial-aid'],createdAt:'2026-10-05T08:20:00Z',request:"My international scholarship disbursement was delayed due to banking verification, and I received an urgent notice regarding tuition fee hold.",triageSummary:'Verified international scholarship delay creating imminent enrolment block risk.',confidence:94,channel:'Email'},
  {id:'STU-10482',studentId:'2402218',need:'Disability & Inclusion',priority:'Medium',status:'New',serviceIds:['disability','academic-support'],createdAt:'2026-10-04T17:15:00Z',request:"I have received my formal ADHD assessment documentation and would like to arrange lecture slide access and quiet exam accommodations.",triageSummary:'Formal ADHD assessment provided; reasonable adjustments and exam accommodations requested.',confidence:93,channel:'Drop-in'},
  {id:'STU-10481',studentId:'2307729',need:'Accommodation Query',priority:'Low',status:'Assigned',serviceIds:['accommodation'],createdAt:'2026-10-04T15:00:00Z',request:"The study room swipe card reader in Riverside Block B is intermittently not registering student ID cards.",triageSummary:'Routine campus residence card reader maintenance ticket.',confidence:99,channel:'Web form'},
  {id:'STU-10480',studentId:'2403157',need:'International Student Advice',priority:'Medium',status:'Assigned',serviceIds:['international'],createdAt:'2026-10-04T11:30:00Z',request:"My student visa validity expires two weeks before my final degree congregation. I need advice on applying for a short extension or graduate route visa.",triageSummary:'Immigration advice requested regarding visa validity timeline near graduation ceremony.',confidence:96,channel:'Web form'},
  {id:'STU-10479',studentId:'2105902',need:'Academic Elective',priority:'Low',status:'Resolved',serviceIds:['academic-support'],createdAt:'2026-10-03T14:10:00Z',request:"Could I have confirmation on the deadline for switching my spring semester elective from Quantum Mechanics II to Astrophysics?",triageSummary:'Module option swap enquiry regarding second semester timetable.',confidence:98,channel:'Email'},
  {id:'STU-10478',studentId:'2405563',need:'Wellbeing Crisis',priority:'High',status:'Assigned',serviceIds:['counselling'],createdAt:'2026-10-03T10:00:00Z',request:"I haven't slept properly for 4 nights, I feel completely disconnected from everyone in my hall, and I'm having panic attacks before morning lectures.",triageSummary:'Acute distress and severe sleep deprivation reported with social isolation.',confidence:97,channel:'Web form'},
  {id:'STU-10477',studentId:'2206641',need:'IT & Library Access',priority:'Low',status:'Resolved',serviceIds:['academic-support'],createdAt:'2026-10-02T16:40:00Z',request:"How do I request off-campus VPN access to the departmental MATLAB compute cluster for my lab coursework?",triageSummary:'Off-campus research cluster VPN access configuration request.',confidence:99,channel:'Web form'}
];

let analysesStore = {
  'STU-10486':{score:92,factors:[['Wellbeing distress','High','Student describes severe stress and feeling overwhelmed.'],['Attendance impact','High','Missed multiple classes and falling behind.'],['Academic risk','Medium','Coursework deadlines approaching.']],explanation:'Classified as High priority due to compound wellbeing distress directly affecting class attendance and impending deadlines.'},
  'STU-10485':{score:64,factors:[['Academic deadline','High','Assignment submission missed.'],['Mitigating circumstances','Medium','Family emergency reported with timeline.'],['Wellbeing concern','Low','No ongoing emotional crisis reported.']],explanation:'Rated Medium priority because coursework submission has elapsed following mitigating circumstances, requiring administrative extension review.'},
  'STU-10484':{score:19,factors:[['Career planning','Low','Standard CV feedback request.'],['Urgency indicators','Low','No immediate deadline pressure.']],explanation:'Classified as Low priority as this is a proactive career advice request with no health or academic risk factors.'},
  'STU-10483':{score:88,factors:[['Enrolment block risk','High','Notice regarding tuition fee hold received.'],['Financial delay','High','Scholarship disbursement pending.'],['Administrative urgency','High','Time-sensitive administrative action needed.']],explanation:'High priority due to immediate institutional block risk from verified external scholarship disbursement delay.'},
  'STU-10482':{score:61,factors:[['Reasonable adjustments','Medium','Formal assessment documentation provided.'],['Academic impact','Medium','Accommodations needed before upcoming mid-terms.'],['Wellbeing risk','Low','Stable presentation with proactive request.']],explanation:'Medium priority for formal disability adjustment registration ahead of mid-term assessment period.'},
  'STU-10481':{score:28,factors:[['Facilities maintenance','Medium','Card reader intermittent failure.'],['Student safety','Low','Alternative entry and general building access intact.'],['Urgency','Low','Routine facilities repair ticket.']],explanation:'Low priority maintenance ticket routed to campus residence facilities team.'},
  'STU-10480':{score:67,factors:[['Visa expiration timeline','High','Visa expires near graduation ceremony.'],['Immigration compliance','Medium','Graduate route transition query.'],['Risk indicator','Low','Several weeks remaining to submit documentation.']],explanation:'Medium priority immigration compliance enquiry requiring advisor verification of CAS timeline.'},
  'STU-10479':{score:14,factors:[['Course administration','Low','Standard module swap question.'],['Urgency','Low','Enquiry regarding future term timetable.']],explanation:'Low priority routine elective query resolved with course schedule information.'},
  'STU-10478':{score:95,factors:[['Acute distress','High','Severe sleep disruption and reported panic attacks.'],['First-year transition','High','Severe isolation reported in university halls.'],['Safeguarding','High','Prompt check-in recommended within 24 hours.']],explanation:'High priority wellbeing triage requiring rapid outreach from university counselling team.'},
  'STU-10477':{score:12,factors:[['Technical access','Low','VPN setup guidance.'],['Urgency','Low','Standard documentation available on university intranet.']],explanation:'Low priority IT access request resolved with knowledge base guide.'}
};

// MIME type map for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  // CORS headers for local demo flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // API 1: NLP Triage analysis endpoint
  if (pathname === '/api/triage' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const text = payload.text || payload.studentInput || '';
        const analysis = await analyzeStudentNeeds(text);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(analysis));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API 2: Cases list and creation
  if (pathname === '/api/cases') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ cases: casesStore, analyses: analysesStore }));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const newCase = JSON.parse(body || '{}');
          if (newCase && newCase.id) {
            casesStore.unshift(newCase);
            if (newCase.analysis) {
              analysesStore[newCase.id] = newCase.analysis;
            }
          }
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, case: newCase }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
  }

  // API 3: Update case status
  if (pathname.startsWith('/api/cases/') && req.method === 'PATCH') {
    const caseId = pathname.replace('/api/cases/', '');
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const found = casesStore.find(c => c.id === caseId);
        if (found) {
          if (payload.status) found.status = payload.status;
          if (payload.escalated !== undefined) found.escalated = payload.escalated;
          if (payload.priority) found.priority = payload.priority;
          if (payload.escalatedAt) found.escalatedAt = payload.escalatedAt;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, case: found }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static file serving from client/ folder
  let relPath = pathname;
  if (relPath.startsWith('/client/')) {
    relPath = relPath.slice(7);
  }
  if (relPath === '' || relPath === '/') {
    relPath = '/index.html';
  }
  if (!relPath.startsWith('/')) {
    relPath = '/' + relPath;
  }
  let filePath = path.join(CLIENT_DIR, relPath);

  // Security check: ensure path is within CLIENT_DIR
  if (!filePath.startsWith(CLIENT_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` OneRoute — Student Wellbeing & Triage Server`);
  console.log(` "One place to start. The right support."`);
  console.log(` Running at: http://localhost:${PORT}`);
  console.log(` - Client Directory: ${CLIENT_DIR}`);
  console.log(` - Student Portal:   http://localhost:${PORT}/student.html`);
  console.log(` - Staff Console:    http://localhost:${PORT}/admin.html`);
  console.log(` - Login / Gateway:  http://localhost:${PORT}/login.html`);
  console.log(`=======================================================`);
});