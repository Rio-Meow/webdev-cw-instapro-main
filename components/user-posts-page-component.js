import { getPosts } from "../api.js";
import { renderHeaderComponent } from "./header-component.js";
import { goToPage, getToken, user } from "../index.js";
import { GLOBAL_PAGE } from "../routes.js";
import { likePost, dislikePost } from "../api.js"; 

export function renderUserPostsPageComponent({ appEl, userId }) {
    console.log("renderUserPostsPageComponent", {appEl, userId});

    let posts = [];
    let isLoading = true;
    let targetUser = null;

    const renderPost = (post) => {
        const isLiked = post.likes.some((like) => like.user?.id === user?.id);

        return `
            <li class="post">
                <div class="post-header">
                    <img src="" alt="Аватар пользователя" class="post-header__user-image">
                    <span class="post-user-name">${post.user.name}</span>
                </div>
                <div class="post-image-container">
                    <img src="" alt="Изображение поста" class="post-image">
                </div>
                <div class="post-likes">
                    <button data-post-id="${post.id}" class="like-button">
                        ${isLiked ?
            `<svg width="24" height="24" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.79 12 5.05C13.09 3.79 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.03L12 21.35Z"/>
                </svg>` :
            `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.79 12 5.05C13.09 3.79 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.03L12 21.35Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`}
                    </button>
                    <p class="post-likes-text">
                        Нравится: <strong>${post.likes.length}</strong>
                    </p>
                </div>
                <p class="post-text">
                <span class="user-name">${post.user.name}</span>
                ${post.description}
                </p>
            </li>
        `;
    };

    const render = () => {
        if (isLoading) {
            appEl.innerHTML = `<div class="posts-loading">Загрузка...</div>`;
            return;
        }

        const userPosts = posts.filter(post => post.user.id === userId);
        targetUser = userPosts.length > 0 ? userPosts[0].user : null;

        let userProfileHTML = '';

        if (targetUser) {
            userProfileHTML = `
                <div class="user-profile">
                    <img src="" alt="Аватар пользователя" class="user-avatar">
                    <h2 class="user-name">Страница пользователя: ${targetUser.name}</h2>
                </div>
            `;
        } else {
            userProfileHTML = `
                <div class="user-profile">
                    <h2>Информация о пользователе не найдена</h2>
                </div>
            `;
        }

        const postsHtml = userPosts.map(renderPost).join('');

        appEl.innerHTML = `
            <div class="page-container">
                <div class="header-container"></div>
                ${userProfileHTML}
                <ul class="posts">
                    ${postsHtml}
                </ul>
            </div>
        `;

        renderHeaderComponent({
            element: document.querySelector(".header-container"),
        });

        for (let likeButton of document.querySelectorAll(".like-button")) {
            likeButton.addEventListener("click", () => {
                const postId = likeButton.dataset.postId;
                const post = posts.find(post => post.id === postId);

                if (!post) {
                    console.error("Пост с ID", postId, "не найден");
                    return;
                }

                const isLiked = post.likes.some((like) => like.user?.id === user?.id);

                if (isLiked) {
                    dislikePost({postId, token: getToken()})
                        .then(() => {
                            post.likes = post.likes.filter((like) => like.user?.id !== user?.id);
                            render();
                        })
                        .catch((error) => {
                            console.error("Ошибка при дизлайке:", error);
                            alert("Не удалось снять лайк");
                        });
                } else {
                    likePost({postId, token: getToken()})
                        .then(() => {
                            post.likes.push({user: {id: user.id}});
                            render();
                        })
                        .catch((error) => {
                            console.error("Ошибка при лайке:", error);
                            alert("Не удалось поставить лайк");
                        });
                }
            });
        }
    };

    getPosts({token: getToken()})
        .then(newPosts => {
            console.log("Загруженные посты (user-posts-page-component.js):", newPosts); 
            posts = newPosts;
            posts.forEach(post => {
                const img = new Image();
                img.src = post.imageUrl;
                img.onload = () => render();
            });
            isLoading = false;
            render();
        })
        .catch(error => {
            console.error("Ошибка при загрузке постов:", error);
            appEl.innerHTML = `<div>Ошибка загрузки постов</div>`;
        });
}