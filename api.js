const personalKey = "prod";
const baseHost = "https://webdev-hw-api.vercel.app";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      return response.json();
    })
    .then((data) => {
      if (data.posts) { 
        return data.posts;
      } else {
        throw new Error("Неверный формат данных от API");
      }
    })
    .catch((error) => {
      console.error("Ошибка при получении постов:", error);
      throw error; 
    });
}

export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Ошибка загрузки файла: ${response.statusText}`);
    }
    return response.json();
  });
}

export function addPost({ description, imageUrl, token }) {
  console.log('Отправляю данные для addPost:', { description, imageUrl, token }); 

  return fetch(postsHost, {
    method: "POST",
    headers: {

      Authorization: token,
    },
    body: JSON.stringify({
      description,
      imageUrl,
    }),
  })
    .then((response) => {
      if (response.status === 400) {
        return response.text().then(text => {
          let errorData = { error: "Не удалось получить детали ошибки от сервера." };
          try {
            errorData = JSON.parse(text); 
          } catch (e) {
            errorData.error = text;
          }
          throw new Error(`Неверные данные для создания поста: ${JSON.stringify(errorData)}`);
        });
      }
      if (response.status === 401) {
        throw new Error("Нет авторизации");
        return response.text().then(text => {
          let errorData = { error: "Неизвестная ошибка сервера." };
          try {
            errorData = JSON.parse(text);
          } catch (e) {
            errorData.error = text;
          }
          throw new Error(`Ошибка создания поста: ${errorData.error || response.statusText}`);
        });
      }
      return response.json();
    });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

export function likePost({ postId, token }) {
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Ошибка при лайке: ${response.status}`);
    }
    return response.json();
  });
}

export function dislikePost({ postId, token }) {
  return fetch(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Ошибка при дизлайке: ${response.status}`);
    }
    return response.json();
  });
}

export function saveUserToLocalStorage(user) {
  window.localStorage.setItem("user", JSON.stringify(user));
}

export function getUserFromLocalStorage() {
  try {
    return JSON.parse(window.localStorage.getItem("user"));
  } catch (error) {
    return null;
  }
}

export function removeUserFromLocalStorage() {
  window.localStorage.removeItem("user");
}