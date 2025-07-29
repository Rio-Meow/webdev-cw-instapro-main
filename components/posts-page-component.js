import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { goToPage } from "../index.js";
import { likePost, dislikePost } from "../api.js";
import { getToken, user } from "../index.js";

export function renderPostsPageComponent({ appEl, posts }) {
  console.log("Актуальный список постов:", posts);

  const renderPost = (post) => {
    const isLiked = post.likes.some((like) => like.user && like.user.id === user?.id);

    return `
      <li class="post">
        <div class="post-header" data-user-id="${post.user.id}">
          <img src="" alt="Аватар пользователя" class="post-header__user-image">
          <p class="post-header__user-name">${post.user.name}</p>
        </div>
        <div class="post-image-container">
          <img class="post-image" src="${post.imageUrl}" alt="Изображение поста">
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
        <p class="post-date">
          ${new Date(post.createdAt).toLocaleString()}
        </p>
      </li>
    `;
  };

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${posts.map(renderPost).join('')}
      </ul>
    </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      const userId = userEl.dataset.userId;
      if (userId) {
        goToPage(USER_POSTS_PAGE, { userId: userId });
      }
    });
  }

  for (let likeButton of document.querySelectorAll(".like-button")) {
    likeButton.addEventListener("click", () => {
      const postId = likeButton.dataset.postId;
      const post = posts.find(post => post.id === postId);

      if (!post) {
        console.error("Пост с ID", postId, "не найден");
        return;
      }

      const isLiked = post.likes.some((like) => like.user && like.user.id === user?.id);

      if (isLiked) {
        dislikePost({ postId, token: getToken() })
          .then(() => {
            post.likes = post.likes.filter((like) => like.user && like.user.id !== user?.id);
            renderPostsPageComponent({ appEl, posts });
          })
          .catch((error) => {
            console.error("Ошибка при дизлайке:", error);
            alert("Не удалось снять лайк");
          });
      } else {
        likePost({ postId, token: getToken() })
          .then(() => {
            post.likes.push({ user: { id: user.id } });
            renderPostsPageComponent({ appEl, posts });
          })
          .catch((error) => {
            console.error("Ошибка при лайке:", error);
            alert("Не удалось поставить лайк");
          });
      }
    });
  }
}