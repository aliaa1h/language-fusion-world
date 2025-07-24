// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const $ = id => document.getElementById(id);

async function login() {
  try {
    const user = await signInWithEmailAndPassword(auth, $("email").value, $("password").value);
    window.location.href = "dashboard.html";
  } catch (e) {
    $("error").textContent = e.message;
  }
}

async function register() {
  try {
    await createUserWithEmailAndPassword(auth, $("email").value, $("password").value);
    window.location.href = "dashboard.html";
  } catch (e) {
    $("error").textContent = e.message;
  }
}

window.logout = async function () {
  await signOut(auth);
  window.location.href = "index.html";
}

window.createOrJoinProject = async function () {
  const project = $("projectName").value;
  const privacy = $("privacy").value;
  const user = auth.currentUser;

  if (!project || !user) return;

  const docRef = doc(db, "projects", project);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(docRef, {
      owner: user.uid,
      privacy,
      vocab: [],
      grammar: []
    });
  }

  localStorage.setItem("project", project);
  loadData();
};

window.addWord = async function () {
  const word = $("vocabWord").value;
  const def = $("vocabDefinition").value;
  const project = localStorage.getItem("project");
  if (!word || !def || !project) return;

  const docRef = doc(db, "projects", project);
  await updateDoc(docRef, {
    vocab: arrayUnion(`${word}: ${def}`)
  });
  $("vocabWord").value = "";
  $("vocabDefinition").value = "";
  loadData();
};

window.addGrammar = async function () {
  const rule = $("grammarRule").value;
  const project = localStorage.getItem("project");
  if (!rule || !project) return;

  const docRef = doc(db, "projects", project);
  await updateDoc(docRef, {
    grammar: arrayUnion(rule)
  });
  $("grammarRule").value = "";
  loadData();
};

async function loadData() {
  const project = localStorage.getItem("project");
  if (!project) return;

  const docRef = doc(db, "projects", project);
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();

  $("vocabList").innerHTML = "";
  data.vocab.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    $("vocabList").appendChild(li);
  });

  $("grammarList").innerHTML = "";
  data.grammar.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    $("grammarList").appendChild(li);
  });
}

auth.onAuthStateChanged(user => {
  if (window.location.pathname.includes("dashboard") && !user) {
    window.location.href = "index.html";
  } else if (user && window.location.pathname.includes("dashboard")) {
    loadData();
  }
});

window.playSound = function (sound) {
  if (!sound) return;
  const audio = new Audio(`https://example.com/sounds/${sound}.mp3`);
  audio.play();
}
