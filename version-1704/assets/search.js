(function() {
  var input = document.getElementById('searchInput');
  var title = document.getElementById('searchTitle');
  var results = document.getElementById('searchResults');
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function card(item) {
    var tags = (item.tags || []).slice(0, 3).map(function(tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card movie-card--medium">' +
      '<a class="movie-card__poster" href="' + escapeHtml(item.url) + '" aria-label="' + escapeHtml(item.title) + '">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="movie-card__score">' + escapeHtml(item.rating) + '</span>' +
      '<span class="movie-card__play">▶</span>' +
      '</a>' +
      '<div class="movie-card__body">' +
      '<div class="movie-card__meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
      '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
      '<p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="movie-card__tags">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function render(query) {
    var q = String(query || '').trim().toLowerCase();
    var source = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
    var matched = q ? source.filter(function(item) {
      return String(item.search || '').toLowerCase().indexOf(q) !== -1;
    }) : source.slice(0, 60);

    if (title) {
      title.textContent = q ? '“' + query + '”的相关内容' : '热门内容';
    }

    if (results) {
      results.innerHTML = matched.slice(0, 120).map(card).join('') || '<p class="empty-result">暂无匹配内容</p>';
    }
  }

  if (input) {
    input.value = initialQuery;
    input.addEventListener('input', function() {
      render(input.value);
    });
  }

  render(initialQuery);
})();
