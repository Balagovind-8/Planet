
const canvas = document.getElementById('orbitCanvas');
const ctx = canvas.getContext('2d');
const infoBox = document.getElementById('planet-info');
const slider = document.getElementById('timelineSlider');

let planets = [];
let angles = [];

async function fetchPlanets() {
  const res = await fetch('https://api.le-systeme-solaire.net/rest/bodies/');
  const data = await res.json();
  return data.bodies.filter(b =>
    ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'].includes(b.id)
  );
}

function mapRadius(au) {
  return 30 + au * 35;
}

function resize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resize);
resize();

async function init() {
  const bodies = await fetchPlanets();
  bodies.forEach(b => {
    const img = new Image();
    img.src = `images/${b.englishName.toLowerCase()}.jpeg`; // or .png
    planets.push({
      name: b.englishName,
      radius: mapRadius(b.semimajorAxis / 149598000),
      image: img,
      mass: b.mass?.massValue ?? 'N/A',
      gravity: b.gravity ?? 'N/A',
      moons: b.moons?.length ?? 0,
      distance: b.semimajorAxis
    });
    angles.push(Math.random() * Math.PI*2);
  });
  requestAnimationFrame(draw);
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const cx = canvas.width/2, cy = canvas.height/2;

  // Draw Sun
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, 2*Math.PI);
  ctx.fillStyle = 'yellow';
  ctx.fill();

  planets.forEach((p,i) => {
    // orbit ring
    ctx.beginPath();
    ctx.arc(cx, cy, p.radius, 0, 2*Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();

    // planet pos
    const angle = angles[i] + slider.value/100;
    const x = cx + p.radius * Math.cos(angle);
    const y = cy + p.radius * Math.sin(angle);

    // draw image
    ctx.drawImage(p.image, x-15, y-15, 30, 30);

    // hover detection
    canvas.addEventListener('mousemove', e => {
      const dx = e.clientX - canvas.offsetLeft - x;
      const dy = e.clientY - canvas.offsetTop - y;
      if (Math.hypot(dx,dy) < 15) {
        infoBox.classList.add('active');
        infoBox.innerHTML = `
          <h3>${p.name}</h3>
          <p>Distance: ${Math.round(p.distance)} km</p>
          <p>Mass: ${p.mass} kg</p>
          <p>Gravity: ${p.gravity} m/s²</p>
          <p>Moons: ${p.moons}</p>
        `;
      } else {
        infoBox.classList.remove('active');
      }
    });

    // increment angle
    angles[i] += 0.002;
  });

  requestAnimationFrame(draw);
}

slider.addEventListener('input', () => {});
init();
