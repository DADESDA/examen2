let db
let db;
let formulario;

const paises = ["Boliva", "Ecuador","Peru","Chile"];

document.addEventListener("DOMContentLoaded",  () => {
     const request = window.indexedDB.open('UsuariosDB', 1);
     request.onerror = (error) =>{
                console.log("Erro al abrir la base de datos", error);
            };
    request.onsuccess = (event) => {
        db = event.target.result;
        console.log("La base de datos esta lista");
  
    };     
    request.onupgradeneeded = (event) => {
        db = event.target.result;
        const objetoUsuario = db.createObjectStore("usuario", {keyPath : "id", autoIncrement :true } );
        objetoUsuario.createIndex("nombre", "nombre", {unique: false});
        objetoUsuario.createIndex("correo", "correo", {unique: false});
        objetoUsuario.createIndex("edad", "edad", {unique: false});
        objetoUsuario.createIndex("pais", "pais", {unique: false});
        console.log("objeto creado", objetoUsuario);
    }
    llenarPais();
    formulario = document.getElementById("formularioUsuario");
    formulario.addEventListener("submit",agregarUsuario);

    document.getElementById("verdatos").addEventListener("click",mostrarUsuario );

});

function llenarPais(){
    const selectPaises = document.getElementById("pais");
    console.log(paises);
    paises.forEach( p => {
        const opciones = document.createElement("option");
        opciones.value = p;
        opciones.textContent = p;
        selectPaises.appendChild(opciones);
    });
    console.log("llenado de paises");
}

function agregarUsuario(e){
    e.preventDefault();
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("email").value.trim();
    const edad = document.getElementById("edad").value.trim();
    const pais = document.getElementById("pais").value.trim();
    if (!nombre || !correo || !edad || !pais) {
        return alert("Todos los campos son obligatorios");
    }
    const tUsuario = db.transaction("usuario","readwrite");
    const oUsuario =  tUsuario.objectStore("usuario");
    const usuario = {nombre, correo, edad, pais};
    const request = oUsuario.add(usuario);
    request.onerror = (error) =>{
                console.log("Error en la tabla usuario", error);
            };
    request.onsuccess = () => {
        console.log("Usuario Agregados");
        mostrarUsuario();
    };    
}

function mostrarUsuario() {
    const listaUsuarios = document.getElementById("lista");
    listaUsuarios.innerHTML = "";
    const lecturaUsuarios = db.transaction("usuario","readonly");
    const oListaUsuario =  lecturaUsuarios.objectStore("usuario");
    const request = oListaUsuario.openCursor();
    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const usuario = cursor.value;
            console.log("item",usuario);
            const div = document.createElement("div");
            div.classList.add("usuario");
            div.innerHTML = `
                <p><strong>Nombre:</strong> <i> ${usuario.nombre}</i> </p>
                <p><strong>Correo:</strong> <i> ${usuario.correo}</i> </p>
                <p><strong>Edad:</strong> <i> ${usuario.edad}</i> </p>
                <p><strong>Pais:</strong> <i> ${usuario.pais}</i> </p>
            `;
            listaUsuarios.appendChild(div);
            cursor.continue();
        }
    }
}