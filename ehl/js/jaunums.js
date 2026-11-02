// Single news article.
const A = ARTICLE;
$('#a-title').textContent = A.title;
$('#a-meta').innerHTML = `<span>${esc(A.author)}</span><span class="dot"></span><span>${esc(A.date)}</span><span class="dot"></span><span>Video</span>`;
$('#a-video').innerHTML = `<iframe src="${A.video}" title="${esc(A.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
$('#a-video').insertAdjacentHTML('afterend', `<a class="video-link" href="${A.video.replace('/embed/', '/watch?v=')}" target="_blank" rel="noopener">▶ Skatīties YouTube →</a>`);
$('#a-body').innerHTML = A.paras.map((p) => p.trim().startsWith('#') ? `<p class="hashtags">${esc(p)}</p>` : `<p>${esc(p)}</p>`).join('');

const here = encodeURIComponent(`${SITE}/jaunumi/olybet-ehl-sadolin-jekabs-livins-s2e04/1926`);
$('#share-fb').href = `https://www.facebook.com/sharer/sharer.php?u=${here}`;
$('#share-fb').innerHTML = ICON.fb;
$('#share-x').href = `https://twitter.com/intent/tweet?url=${here}`;
$('#share-x').innerHTML = ICON.x;

$('#more-news').innerHTML = NEWS.filter((n) => n.title !== A.title).slice(0, 6).map((n) => `
  <a href="${link(n.url)}"><img src="${n.img}" alt="" loading="lazy"><h4>${esc(n.title)}</h4></a>`).join('');
$('#side').insertAdjacentHTML('beforeend', leadersCard());
