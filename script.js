let races = [];

// 1. 데이터 불러오기
fetch("races_2026.json")
  .then(res => res.json())
  .then(data => {
    races = data;
    init();
  });

function init() {
  renderRaces();
  setupNextRace();
}

// 2. 다음 레이스 찾기
function getNextRace() {
  const now = new Date();

  return races.find(r => new Date(r.raceDate) > now);
}

// 3. 카운트다운
function setupNextRace() {
  const next = getNextRace();

  if (!next) return;

  document.getElementById("next-race-name").innerText = next.name;

  const target = new Date(next.raceDate).getTime();

  setInterval(() => {
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      document.getElementById("countdown").innerText = "🏁 RACE STARTED!";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("countdown").innerText =
      `${days}d ${hours}h ${minutes}m ${seconds}s`;

  }, 1000);
}

// 4. 4x6 그리드 렌더
function renderRaces() {
  const grid = document.getElementById("race-grid");
  grid.innerHTML = "";

  races.forEach(race => {
    const div = document.createElement("div");
    div.className = "race-card";

    div.innerHTML = `
      <h3>${race.name}</h3>
      <p>${race.circuit}</p>
      <small>${race.date}</small>
    `;

    div.onclick = () => openRace(race);

    grid.appendChild(div);
  });
}

// 5. 클릭 → 상세
function openRace(race) {
  const detail = document.getElementById("detail");

  detail.innerHTML = `
    <h2>${race.name}</h2>
    <p>${race.circuit}</p>
    <div id="sessions">Loading sessions...</div>
  `;

  loadSessions(race);
}

// 6. 세션 결과 (FP1~Race)
async function loadSessions(race) {
  const order = ["FP1", "FP2", "FP3", "Qualifying"];

  if (race.hasSprint) {
    order.push("Sprint");
  }

  order.push("Race");

  const container = document.getElementById("sessions");
  container.innerHTML = "";

  for (let session of order) {
    try {
      const res = await fetch(`data/results/${race.id}_${session}.json`);
      const data = await res.json();

      const block = document.createElement("div");

      block.innerHTML = `
        <h3>${session}</h3>
        <ol>
          ${data.results.map(r =>
            `<li>P${r.position} - ${r.driver}</li>`
          ).join("")}
        </ol>
      `;

      container.appendChild(block);

    } catch (e) {
      // 데이터 없으면 스킵
    }
  }
}
