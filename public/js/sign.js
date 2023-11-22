// const { signup } = require("./login");
const username = document.getElementById("name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const formSignup = document.querySelector(".form-signup");
const formLogin = document.querySelector(".form-login");
const logoutBtn = document.getElementById("logout");
const enterSpaceBtn = document.getElementById("space-btn");
const createSpaceBtn = document.getElementById("new-space-btn");

const signup = async (data) => {
  const res = await fetch("http://localhost:3000/api/v1/user/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const data1 = await res.json();
  if (res.ok) {
    showAlert("success", "Sign up Successfully");
    window.setTimeout(() => {
      location.assign("/");
    });
  } else {
    showAlert("error", data1.message);
  }
};

const login = async (data) => {
  const res = await fetch("http://localhost:3000/api/v1/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const data1 = await res.json();

  if (res.ok) {
    showAlert("success", "Log in Successfully");
    window.setTimeout(() => {
      location.assign("/");
    }, 1500);
  } else {
    showAlert("error", data1.message);
  }
};

const logout = async () => {
  console.log("running");
  const res = await fetch("http://localhost:3000/api/v1/user/logout", {
    method: "GET",
  });

  if (res.ok) {
    showAlert("success", "Log out Successfully");
    window.setTimeout(() => {
      location.reload();
    }, 1500);
  } else {
    showAlert("error", "Failed to logout");
  }
};

//Handling space entry
const enterSpaceHandler = async (spaceID) => {
  const data1 = { spaceID };
  const res = await fetch("http://localhost:3000/api/v1/space/enter-space", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data1),
  });
  const data = await res.json();
  console.log(data);
  if (res.status === 200) {
    location.assign(`/space?spaceId=${spaceID}`);
  } else {
    showAlert("error", data.message);
  }
};

const createSpaceHandler = async () => {
  const res = await fetch("http://localhost:3000/api/v1/space/create-space", {
    method: "GET",
  });
  const data = await res.json();
  console.log(data);
  if (res.status === 200) {
    showAlert("success", "Welcome to space");
    location.assign(`/space?spaceId=${data.space.spaceID}`);
  } else {
    showAlert("error", data.message);
  }
};

// Entering into existing space
if (enterSpaceBtn) {
  enterSpaceBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const spaceID = document.getElementById("spaceID").value;
    enterSpaceHandler(spaceID);
  });
}

if (createSpaceBtn) {
  createSpaceBtn.addEventListener("click", (e) => {
    e.preventDefault();
    createSpaceHandler();
  });
}

function submitHandler() {
  const name = username.value.trim();
  if (name.length === 0) {
    if (username.parentNode.childNodes.length === 3) return;
    createErrorElement(username, "Please Enter your username.");
    return;
  }
  if (email.value.length === 0) {
    if (email.parentNode.childNodes.length === 3) return;
    createErrorElement(email, "Please enter your email.");
    return;
  }
  if (password.value.length === 0) {
    if (password.parentNode.childNodes.length === 4) return;
    createErrorElement(password, "Please enter your password.");
    return;
  }
  if (password.value !== confirmPassword.value) {
    if (confirmPassword.parentNode.childNodes.length === 4) return;
    createErrorElement(confirmPassword, "Password did not matched.");
    return;
  }

  const data = {
    name: username.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  };
  console.log(data);
  signup(data);
}

function loginFormHandler(loginEmail, loginPassword) {
  if (loginEmail.value.length === 0) {
    if (loginEmail.parentNode.childNodes.length === 3) return;
    createErrorElement(loginEmail, "Please enter your email.");
    return;
  }
  if (loginPassword.value.length === 0) {
    if (loginPassword.parentNode.childNodes.length === 4) return;
    createErrorElement(loginPassword, "Please enter your password.");
    return;
  }
  const data = {
    email: loginEmail.value,
    password: loginPassword.value,
  };
  login(data);
}

if (formSignup) {
  focusEventListner(username, 2);
  focusEventListner(email, 2);
  focusEventListner(password, 3);
  focusEventListner(confirmPassword, 3);
  formSignup.addEventListener("submit", (e) => {
    e.preventDefault();
    submitHandler();
  });
}

if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");
    focusEventListner(loginEmail, 2);
    focusEventListner(loginPassword, 3);
    e.preventDefault();
    loginFormHandler(loginEmail, loginPassword);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("clicked");
    logout();
  });
}

//creating error element

function createErrorElement(el, msg) {
  let p = document.createElement("p");
  p.classList.add("input-error_message");
  p.innerHTML = "*" + msg;
  p.id = "error";
  el.classList.add("input-error");
  el.parentElement.appendChild(p);
}

//handling focus
function focusEventListner(el, n) {
  el.addEventListener("focus", () => {
    el.classList.remove("input-error");
    if (el.parentNode.childNodes[n]) {
      el.parentNode.childNodes[n].remove();
    }
  });
}

//error-div
const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or error
const showAlert = (type, msg) => {
  hideAlert();

  const markup = `<div class="alert alert-${type}">${msg}<div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  window.setTimeout(hideAlert, 5000);
};
