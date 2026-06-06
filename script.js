let favoriteRepos = [];

// FETCH GITHUB DATA

async function fetchRepos() {

  const username =
    document.getElementById("usernameInput").value.trim();

  const output =
    document.getElementById("output");

  const profile =
    document.getElementById("profile");

  const analytics =
    document.getElementById("analyticsContent");

  if (!username) {

    output.innerHTML =
      "<p>Please enter GitHub username.</p>";

    return;
  }

  output.innerHTML = "";
  profile.innerHTML = "";

  try {

    // PROFILE FETCH

    const profileResponse =
      await fetch(
        `https://api.github.com/users/${username}`
      );

    if (!profileResponse.ok) {
      throw new Error("User not found");
    }

    const user =
      await profileResponse.json();

    // REPOSITORY FETCH

    const reposResponse =
      await fetch(
        `https://api.github.com/users/${username}/repos`
      );

    const repos =
      await reposResponse.json();

    // SEARCH HISTORY

    let recentUsers =
      JSON.parse(localStorage.getItem("recentUsers")) || [];

    if (!recentUsers.includes(username)) {

      recentUsers.unshift(username);

      if (recentUsers.length > 5) {
        recentUsers.pop();
      }

      localStorage.setItem(
        "recentUsers",
        JSON.stringify(recentUsers)
      );
    }

    renderHistory();

    // PROFILE SECTION

    profile.innerHTML = `

      <div class="profile-hero">

        <div class="profile-main">

          <img
            src="${user.avatar_url}"
            class="avatar"
            alt="avatar"
          >

          <div class="profile-info">

            <h2>
              ${user.name || user.login}
            </h2>

            <p class="bio">
              ${user.bio || "Passionate developer building cool things."}
            </p>

            <div class="profile-links">

              <span>
                📍 ${user.location || "Unknown"}
              </span>

              <a
                href="${user.html_url}"
                target="_blank"
              >
                🔗 GitHub Profile
              </a>

            </div>

          </div>

        </div>

        <div class="stats-grid">

          <div class="stat-card">

            <h3>
              ${user.public_repos}
            </h3>

            <p>
              Repositories
            </p>

          </div>

          <div class="stat-card">

            <h3>
              ${user.followers}
            </h3>

            <p>
              Followers
            </p>

          </div>

          <div class="stat-card">

            <h3>
              ${user.following}
            </h3>

            <p>
              Following
            </p>

          </div>

        </div>

      </div>
    `;

    // SORT REPOSITORIES

    const sortOption =
      document.getElementById("sortSelect").value;

    if (sortOption === "stars") {

      repos.sort(
        (a, b) =>
          b.stargazers_count - a.stargazers_count
      );

    } else {

      repos.sort(
        (a, b) =>
          new Date(b.updated_at) -
          new Date(a.updated_at)
      );
    }

    // ANALYTICS

    let totalStars = 0;
    let totalForks = 0;

    const languageCount = {};

    repos.forEach(repo => {

      totalStars += repo.stargazers_count;

      totalForks += repo.forks_count;

      if (repo.language) {

        languageCount[repo.language] =
          (languageCount[repo.language] || 0) + 1;
      }
    });

    analytics.innerHTML = `

      <div class="analytics-grid">

        <div class="analytics-card">

          <h3>
            ${repos.length}
          </h3>

          <p>
            Repositories
          </p>

        </div>

        <div class="analytics-card">

          <h3>
            ${totalStars}
          </h3>

          <p>
            Total Stars
          </p>

        </div>

        <div class="analytics-card">

          <h3>
            ${totalForks}
          </h3>

          <p>
            Total Forks
          </p>

        </div>

      </div>

      <div class="language-bars">

        ${Object.entries(languageCount)

          .sort((a, b) => b[1] - a[1])

          .slice(0, 5)

          .map(([language, count]) => `

            <div class="lang-row">

              <span>
                ${language}
              </span>

              <div class="bar">

                <div
                  class="fill"
                  style="width:${count * 20}%"
                ></div>

              </div>

            </div>

          `)

          .join("")}

      </div>
    `;

    // REPOSITORIES

    output.innerHTML =
      "<h2>Repositories</h2><div class='repo-grid'>";

    repos.forEach(repo => {

      output.innerHTML += `

        <div class="repo-card">

          <div class="repo-top">

            <h3>

              <a
                href="${repo.html_url}"
                target="_blank"
              >
                ${repo.name}
              </a>

            </h3>

            <span class="repo-badge">

              ${repo.private ? "Private" : "Public"}

            </span>

          </div>

          <p>

            ${repo.description || "No description available."}

          </p>

          <div class="repo-stats">

            <span>
              ⭐ ${repo.stargazers_count}
            </span>

            <span>
              🍴 ${repo.forks_count}
            </span>

            <span>
              💻 ${repo.language || "N/A"}
            </span>

            <span>
              🕒 ${new Date(repo.updated_at).toLocaleDateString()}
            </span>

          </div>

          <button
            class="favorite-btn"
            onclick="addToFavorites(
              '${repo.name}',
              '${repo.html_url}'
            )"
          >
            ⭐ Add to Favorites
          </button>

        </div>

      `;
    });

    output.innerHTML += "</div>";

  } catch(error) {

    output.innerHTML = `

      <p>
        Error: ${error.message}
      </p>

    `;
  }
}

// FAVORITES

function addToFavorites(name, url) {

  if (
    favoriteRepos.some(
      repo => repo.name === name
    )
  ) {
    return;
  }

  favoriteRepos.push({
    name,
    url
  });

  const favorites =
    document.getElementById("favoritesContent");

  favorites.innerHTML =
    favoriteRepos.map(repo => `

      <a
        href="${repo.url}"
        target="_blank"
        class="favorite-item"
      >
        ⭐ ${repo.name}
      </a>

    `).join("");
}

// HISTORY

function renderHistory() {

  const history =
    document.getElementById("history");

  const recentUsers =
    JSON.parse(localStorage.getItem("recentUsers")) || [];

  if (recentUsers.length === 0) {

    history.innerHTML = "";

    return;
  }

  history.innerHTML = `

    <p>

      <strong>
        Recent Searches:
      </strong>

      ${recentUsers.map(
        user => `<span>${user}</span>`
      ).join("")}

    </p>

  `;
}

// CLEAR HISTORY

function clearHistory() {

  localStorage.removeItem("recentUsers");

  renderHistory();
}

// THEME

function toggleTheme() {

  document.body.classList.toggle("light-mode");
}

// STACKOVERFLOW

function loadStackOverflow() {

  const container =
    document.getElementById("stackoverflow");

  fetch(
    "https://api.stackexchange.com/2.3/questions?order=desc&sort=creation&tagged=java&site=stackoverflow"
  )

    .then(res => res.json())

    .then(data => {

      container.innerHTML = "";

      data.items.slice(0, 5).forEach(question => {

        container.innerHTML += `

          <a
            href="${question.link}"
            target="_blank"
          >
            ${question.title}
          </a>

        `;
      });
    });
}

// ENTER KEY SEARCH

document
  .getElementById("usernameInput")

  .addEventListener(
    "keypress",
    function(event) {

      if (event.key === "Enter") {

        fetchRepos();
      }
    }
  );

// SIDEBAR ACTIVE + SCROLL

document
  .querySelectorAll(".nav-links div")

  .forEach(tab => {

    tab.addEventListener("click", () => {

      document
        .querySelectorAll(".nav-links div")

        .forEach(t =>
          t.classList.remove("active")
        );

      tab.classList.add("active");

      const text =
        tab.innerText.toLowerCase();

      if (text.includes("dashboard")) {

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      } else if (text.includes("analytics")) {

        document
          .getElementById("analyticsSection")
          ?.scrollIntoView({
            behavior: "smooth"
          });

      } else if (text.includes("favorites")) {

        document
          .getElementById("favoritesSection")
          ?.scrollIntoView({
            behavior: "smooth"
          });

      } else if (text.includes("settings")) {

        document
          .getElementById("settingsSection")
          ?.scrollIntoView({
            behavior: "smooth"
          });

      } else if (text.includes("trending")) {

        document
          .getElementById("output")
          ?.scrollIntoView({
            behavior: "smooth"
          });
      }
    });
  });

// INITIAL LOAD

renderHistory();

loadStackOverflow();
