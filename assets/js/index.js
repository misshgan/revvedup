// JavaScript files are compiled and minified during the build process to the assets/built folder. See available scripts in the package.json file.

// Import CSS
import "../css/index.css";
import GhostContentAPI from "@tryghost/content-api";

function handleResources() {
    // Initialize Ghost Content API Client
    const api = new GhostContentAPI({
        url: "http://localhost:2368", // Replace with your URL
        key: "bac39dba3e4a73fbc0f81cbdec", // Replace with your key
        version: "v5.0", // Ensure the API version matches
    });

    const resourcesContainer = document.querySelector(".resources__cards");
    const paginationContainer = document.querySelector(
        ".resources__pagination"
    );
    const filterButtons = document.querySelectorAll(
        ".resources__filter .button"
    );

    let currentPage = 1;
    let currentFilter = "all";
    let totalPages = 0;

    // Function to load posts
    async function loadPosts(page = 1, filter = "all") {
        try {
            const params = {
                limit: 6,
                page,
                include: 'authors',
                filter: filter !== "all" ? `tag:${filter}` : undefined,
            };

            const response = await api.posts.browse(params);
            totalPages = response.meta.pagination.pages;

            renderPosts(response);
            updatePagination();
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    }

    // Function to render posts
    function renderPosts(posts) {
        resourcesContainer.innerHTML = "";

        posts.forEach((post) => {
            const card = document.createElement("article");
            card.className = "card card--default";

            const featureImage = post.feature_image ? 
            `
            <a href='${post.url}'>
                <picture class="card__image">
                    <img src="${post.feature_image}" alt='${post.title}'>
                </picture>
            </a>
            ` : '';

            const description = post.custom_excerpt ? 
            `
            <p class="card__description">${post.custom_excerpt}</p>
            ` : '';
            
            card.innerHTML = `
                ${featureImage}
                <div class="card__main">
                    <div class="card__text">
                        <h3 class="card__title">
                            <a href="${post.url}">${post.title}</a>
                        </h3>
                        <div class="card__meta">
                            <time datetime="${new Date(post.published_at).toISOString()}">
                                ${new Date(post.published_at).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </time>
                        </div>
                        ${description}
                        <div class="card__footer">
                            <div class="card__author">
                                <img src="${post.primary_author.profile_image || ''}" alt="${post.primary_author.name}">
                                <span>${post.primary_author.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `

            resourcesContainer.appendChild(card);
        });
    }

    // Function to update pagination
    function updatePagination() {
        const prevButton = paginationContainer.querySelector(".resources-prev");
        const nextButton = paginationContainer.querySelector(".resources-next");
        const numbersContainer = paginationContainer.querySelector(
            ".resources__pagination-numbers"
        );

        if (totalPages <= 1) {
            paginationContainer.style.display = "none";
            return;
        }

        paginationContainer.style.display = "flex";
        numbersContainer.innerHTML = "";

        const createPageButton = (page) => {
            const pageButton = document.createElement("button");
            pageButton.textContent = page;
            pageButton.className = page === currentPage ? "active" : "";
            pageButton.addEventListener("click", () => {
                currentPage = page;
                loadPosts(currentPage, currentFilter);
            });
            numbersContainer.appendChild(pageButton);
        };

        // Add first page and ellipsis if needed
        if (currentPage > 3) {
            createPageButton(1);
            if (currentPage > 4) {
                const ellipsis = document.createElement("span");
                ellipsis.textContent = "...";
                numbersContainer.appendChild(ellipsis);
            }
        }

        // Add current page and two pages before and after
        for (
            let i = Math.max(1, currentPage - 2);
            i <= Math.min(totalPages, currentPage + 2);
            i++
        ) {
            createPageButton(i);
        }

        // Add last page and ellipsis if needed
        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) {
                const ellipsis = document.createElement("span");
                ellipsis.textContent = "...";
                numbersContainer.appendChild(ellipsis);
            }
            createPageButton(totalPages);
        }

        prevButton.style.display = currentPage === 1 ? "none" : "block";
        nextButton.style.display =
            currentPage === totalPages ? "none" : "block";

        prevButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                loadPosts(currentPage, currentFilter);
            }
        };

        nextButton.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadPosts(currentPage, currentFilter);
            }
        };
    }

    // Function to handle filters
    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            currentFilter = button.getAttribute("data-category");
            currentPage = 1;

            filterButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");

            loadPosts(currentPage, currentFilter);
        });
    });

    // Initialize
    loadPosts();
}

handleResources();
