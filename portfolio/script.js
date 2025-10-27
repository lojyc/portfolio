/* ================= Smooth scroll on nav ================= */
document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const dest = document.querySelector(this.getAttribute('href'));
    if (dest) dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ================= Project images mapping (edit per project) =================
   Key = data-project attribute (integer string).
   Values = ordered array of relative paths (images and/or .mp4).
   Add or remove files here when you add new project folders.
*/
const projectImages = {
  "1": [
    "assets/project1/images/screenshot1.jpg",
    "assets/project1/images/screenshot2.jpg",
    "assets/project1/images/screenshot3.jpg",
    "assets/project1/images/screenshot4.jpg",
    "assets/project1/images/screenshot5.jpg"
  ],
  "2": [
    "assets/project2/images/screenshot1.jpg",
    "assets/project2/images/screenshot2.jpg",
    "assets/project2/images/screenshot3.jpg"
  ],
  "3": [
    "assets/project3/images/screenshot1.jpg",
    "assets/project3/images/screenshot2.jpg",
    "assets/project3/images/screenshot3.jpg"
  ],
  "4": [
    "assets/project4/images/screenshot1.jpg",
    "assets/project4/images/screenshot2.jpg",
    "assets/project4/images/screenshot3.jpg"
  ],
  "5": [
    "assets/project5/images/screenshot1.jpg",
    "assets/project5/images/screenshot2.jpg"
  ],
  "6": [
    "assets/project6/images/screenshot1.jpg",
    "assets/project6/images/screenshot2.jpg",
    "assets/project6/images/screenshot3.jpg"
  ]
};

/* ================= Hover slideshow + click-to-open gallery ================= */
const projectCards = Array.from(document.querySelectorAll('.project-card'));
const galleryModal = document.getElementById('galleryModal');
const galleryImage = document.getElementById('galleryImage');
const galleryVideo = document.getElementById('galleryVideo');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const galleryClose = document.getElementById('galleryClose');

let activeInterval = null;
let currentProject = null;
let currentIndex = 0;

/* Helper to set thumbnail content (image or video) */
function setThumbnailElement(thumbnailEl, src) {
  // thumbnailEl is the .thumbnail element
  if (!src) return;
  if (src.toLowerCase().endsWith('.mp4')) {
    thumbnailEl.innerHTML = `<video src="${src}" muted loop playsinline></video>`;
    const vid = thumbnailEl.querySelector('video');
    vid.play().catch(()=>{/* autoplay may be blocked on some browsers */});
  } else {
    thumbnailEl.innerHTML = `<img src="${src}" alt="">`;
  }
}

/* iterate all project cards -> attach hover & click */
projectCards.forEach(card => {
  const pid = card.dataset.project;
  const imgs = projectImages[pid];
  const thumbnailEl = card.querySelector('.thumbnail');
  
  if (!imgs || imgs.length === 0) return;

  // Use a persistent <img> element
  const imgEl = document.createElement("img");
  imgEl.src = imgs[0];
  thumbnailEl.innerHTML = "";
  thumbnailEl.appendChild(imgEl);

  let index = 0;
  let intervalId = null;

  card.addEventListener("mouseenter", () => {
    if (imgs.length <= 1) return;
    intervalId = setInterval(() => {
      index = (index + 1) % imgs.length;
      imgEl.src = imgs[index];
    }, 1500);
  });

  card.addEventListener("mouseleave", () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    index = 0;
    imgEl.src = imgs[0]; // reset to first
  });

  card.addEventListener("click", () => {
    currentProject = pid;
    currentIndex = 0;
    openGallery(pid, currentIndex);
  });
});

/* ================= Gallery modal functions ================= */
function openGallery(projectId, startIndex = 0) {
  const imgs = projectImages[projectId];
  if (!imgs || imgs.length === 0) return;
  currentProject = projectId;
  currentIndex = startIndex;
  displayGalleryMedia(projectImages[projectId][currentIndex]);
  galleryModal.setAttribute('aria-hidden', 'false');
  galleryModal.style.display = 'flex';
  // lock scroll
  document.body.style.overflow = 'hidden';
}
function closeGallery() {
  galleryModal.setAttribute('aria-hidden', 'true');
  galleryModal.style.display = 'none';
  galleryImage.style.display = 'none';
  galleryVideo.style.display = 'none';
  galleryVideo.pause && galleryVideo.pause();
  document.body.style.overflow = '';
}

/* display either image or video inside the gallery modal */
function displayGalleryMedia(src) {
  if (!src) return;
  if (src.toLowerCase().endsWith('.mp4')) {
    galleryImage.style.display = 'none';
    galleryVideo.style.display = 'block';
    galleryVideo.src = src;
    galleryVideo.currentTime = 0;
    galleryVideo.play().catch(()=>{/* autoplay blocked fallback */});
  } else {
    galleryVideo.style.display = 'none';
    galleryVideo.src = '';
    galleryImage.style.display = 'block';
    galleryImage.src = src;
  }
}

/* prev / next */
nextBtn.addEventListener('click', () => {
  const set = projectImages[currentProject];
  if (!set) return;
  currentIndex = (currentIndex + 1) % set.length;
  displayGalleryMedia(set[currentIndex]);
});
prevBtn.addEventListener('click', () => {
  const set = projectImages[currentProject];
  if (!set) return;
  currentIndex = (currentIndex - 1 + set.length) % set.length;
  displayGalleryMedia(set[currentIndex]);
});

/* close handlers */
galleryClose.addEventListener('click', closeGallery);
/* close by clicking outside the media */
galleryModal.addEventListener('click', (e) => {
  if (e.target === galleryModal) closeGallery();
});
/* keyboard navigation */
document.addEventListener('keydown', (e) => {
  if (galleryModal.style.display === 'flex') {
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'Escape') closeGallery();
  }
});

/* ================= Icon strip duplication fix ================= */
const strip = document.querySelector(".strip-track");
if (strip) {
  const icons = strip.innerHTML.trim();
  strip.innerHTML = icons + icons; // just double it
}
//MODIFIED SCROLLING ICONS LOGIC (moved from css to js and modified to not cause stutters)
const stripTrack = document.querySelector('.strip-track');
const iconSet = stripTrack.querySelector('.icon-set');
const clone = iconSet.cloneNode(true);
stripTrack.appendChild(clone);

let scrollX = 0;
let lastTime = performance.now();
const speed = 1.0;

function animateScroll(now) {
  const delta = now - lastTime;
  lastTime = now;

  scrollX -= speed * (delta / 16.67);
  const offset = scrollX % iconSet.offsetWidth;
  stripTrack.style.transform = `translate3d(${Math.floor(offset)}px, 0, 0)`;
  requestAnimationFrame(animateScroll);
}

requestAnimationFrame(animateScroll);
//END MODIFICATION


/* ================= Document modal ================= */
const docModal = document.getElementById('docModal');
const docFrame = document.getElementById('docFrame');
const docClose = document.getElementById('docClose');

/* Open document modal */
function openDoc(path) {
  docFrame.src = path + "#view=FitH"; // ensures full width view
  docModal.setAttribute('aria-hidden', 'false');
  docModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/* Close document modal */
function closeDoc() {
  docFrame.src = ''; // reset when closed
  docModal.setAttribute('aria-hidden', 'true');
  docModal.style.display = 'none';
  document.body.style.overflow = '';
}

/* Close events */
docClose.addEventListener('click', closeDoc);
docModal.addEventListener('click', (e) => {
  if (e.target === docModal) closeDoc();
});

/* Attach click to each document card */
document.querySelectorAll('.doc-card').forEach(card => {
  card.addEventListener('click', () => {
    const docPath = card.getAttribute('data-doc');
    if (docPath) {
      openDoc(docPath);
    }
  });
});

/*docClose.addEventListener('click', closeDoc);
docModal.addEventListener('click', (e) => { if (e.target === docModal) closeDoc(); });

/* ================= Notes for adding projects & icons =================
 - To add a new project:
   1) Add an HTML .project-card in the project-list with data-project="7" (next id).
   2) Add files to Assets/Project7/Images/ (screenshot1.jpg, screenshot2.jpg, etc.)
   3) Add an entry in projectImages mapping above: "7": ["Assets/Project7/Images/s1.jpg", ...]
 - To add icons to the scrolling strip:
   Put icon files in Assets/Icons/ and add <img> tags inside .strip-track in index.html.
   The track is duplicated in HTML so the CSS animation loops smoothly.
*/