import * as firebase from "firebase/app";

import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyACf130jnv_mYX-eS8ZaEKpKSYe0tAg0tA",
    authDomain: "travycomsats.firebaseapp.com",
    databaseURL: "https://travycomsats.firebaseio.com",
    projectId: "travycomsats",
    storageBucket: "travycomsats.appspot.com",
    messagingSenderId: "3416567928",
    appId: "1:3416567928:web:abf19a8fbdd6a20fc03d8d"
};

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();

export { firebase, firestore };
