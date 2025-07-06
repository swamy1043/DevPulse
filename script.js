function fetchRepos() {
  const username = document.getElementById("usernameInput").value;
  const output = document.getElementById("output");
  const profile = document.getElementById("profile");

  output.innerHTML = "";
  profile.innerHTML = "";

  if (!username) {
    output.innerHTML = "<p>Please enter a username.</p>";
    return;
  }

  // 🔁 Log to backend PHP
  fetch("backend/log.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username })
  });

  // 💾 Save to local storage
  let recentUsers = JSON.parse(localStorage.getItem("recentUsers")) || [];
  if (!recentUsers.includes(username)) {
    recentUsers.unshift(username);
    if (recentUsers.length > 5) recentUsers.pop();
    localStorage.setItem("recentUsers", JSON.stringify(recentUsers));
  }
  renderHistory();

  const profileUrl = `https://api.github.com/users/${username}`;
  const reposUrl = `https://api.github.com/users/${username}/repos`;

  // 👤 GitHub Profile Fetch
  fetch(profileUrl)
    .then(response => {
      if (!response.ok) throw new Error("User not found");
      return response.json();
    })
    .then(user => {
      profile.innerHTML = `
        <div class="profile-box">
          <img src="${user.avatar_url}" alt="Avatar" class="avatar">
          <div class="profile-details">
            <h2>${user.name || user.login}</h2>
            <p>${user.bio || "No bio available"}</p>
            <p>📁 Repos: ${user.public_repos} | 👥 Followers: ${user.followers} | 👣 Following: ${user.following}</p>
            <p><a href="${user.html_url}" target="_blank">🔗 View GitHub Profile</a></p>
          </div>
        </div>
      `;
    });

  // 📦 GitHub Repos Fetch + Sort
  fetch(reposUrl)
    .then(response => {
      if (!response.ok) throw new Error("Repos not found");
      return response.json();
    })
    .then(data => {
      const sortOption = document.getElementById("sortSelect").value;

      if (sortOption === "stars") {
        data.sort((a, b) => b.stargazers_count - a.stargazers_count);
      } else if (sortOption === "updated") {
        data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      }

      output.innerHTML = "<h2>Repositories:</h2><div class='repo-grid'>";
      data.forEach(repo => {
        output.innerHTML += `
          <div class="repo-card">
            <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
            <p>${repo.description || "No description provided."}</p>
            <div class="repo-stats">
              ⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count} | 🕒 Updated: ${new Date(repo.updated_at).toLocaleDateString()}
            </div>
          </div>
        `;
      });
      output.innerHTML += "</div>";
    })
    .catch(error => {
      profile.innerHTML = "";
      output.innerHTML = `<p>Error: ${error.message}</p>`;
    });
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function loadTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark");
  }
}

function renderHistory() {
  const history = document.getElementById("history");
  const recentUsers = JSON.parse(localStorage.getItem("recentUsers")) || [];
  if (recentUsers.length === 0) {
    history.innerHTML = "";
    return;
  }
  history.innerHTML = `<p><strong>Recent Searches:</strong> ${recentUsers.map(u => `<span>${u}</span>`).join(", ")}</p>`;
}

function loadStackOverflow() {
  const container = document.getElementById("stackoverflow");
  fetch("https://api.stackexchange.com/2.3/questions?order=desc&sort=creation&tagged=java&site=stackoverflow")
    .then(res => res.json())
    .then(data => {
      data.items.slice(0, 5).forEach(q => {
        container.innerHTML += `<a href="${q.link}" target="_blank">${q.title}</a>`;
      });
    })
    .catch(() => {
      container.innerHTML = "<p>Failed to load questions.</p>";
    });
}

// 🚀 Initial Setup
loadTheme();
renderHistory();
loadStackOverflow();
