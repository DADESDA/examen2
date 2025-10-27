// ==========================
// CONFIGURAR INDEXEDDB
// ==========================
let db;
const request = indexedDB.open("miTiendaDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;

  // Tabla de CLIENTES
  if (!db.objectStoreNames.contains("clientes")) {
    const clientesStore = db.createObjectStore("clientes", { keyPath: "id", autoIncrement: true });
    clientesStore.createIndex("nombre", "nombre", { unique: false });
    clientesStore.createIndex("ci", "ci", { unique: true });
  }

  // Tabla de PEDIDOS
  if (!db.objectStoreNames.contains("pedidos")) {
    const pedidosStore = db.createObjectStore("pedidos", { keyPath: "id", autoIncrement: true });
    pedidosStore.createIndex("clienteId", "clienteId", { unique: false });
    pedidosStore.createIndex("producto", "producto", { unique: false });
  }

  console.log("✅ Base de datos creada correctamente");
};

request.onsuccess = function (event) {
  db = event.target.result;
  console.log("💾 Conexión exitosa a IndexedDB");

  // Llenar select de clientes al iniciar
  cargarClientesEnSelect();
};

request.onerror = function (event) {
  console.error("❌ Error al abrir la base de datos:", event.target.error);
};

// ==========================
// FUNCIONES CRUD - CLIENTES
// ==========================

// Agregar cliente
function agregarCliente(nombre, ci) {
  const tx = db.transaction("clientes", "readwrite");
  const store = tx.objectStore("clientes");
  store.add({ nombre, ci });
  tx.oncomplete = () => {
    console.log("Cliente agregado:", nombre);
    cargarClientesEnSelect(); // actualizar el select
  };
  tx.onerror = (e) => console.error("Error al agregar cliente:", e.target.error);
}

// Listar clientes
function listarClientes(callback) {
  const tx = db.transaction("clientes", "readonly");
  const store = tx.objectStore("clientes");
  const request = store.getAll();

  request.onsuccess = function () {
    callback(request.result);
  };
}

// ==========================
// FUNCIONES CRUD - PEDIDOS
// ==========================

// Agregar pedido
function agregarPedido(clienteId, producto, cantidad) {
  const tx = db.transaction("pedidos", "readwrite");
  const store = tx.objectStore("pedidos");
  store.add({ clienteId, producto, cantidad });
  tx.oncomplete = () => console.log("Pedido agregado para cliente ID:", clienteId);
}

// ==========================
// CONEXIÓN CON FORMULARIOS HTML
// ==========================

// Formulario CLIENTES
const formClientes = document.querySelector("#clientes form");
formClientes.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const ci = document.getElementById("ci").value;

  if (nombre && ci) {
    agregarCliente(nombre, ci);
    formClientes.reset();
  } else {
    alert("Por favor, completa todos los campos del cliente.");
  }
});

// Formulario PEDIDOS
const formPedidos = document.querySelector("#pedidos form");
formPedidos.addEventListener("submit", (e) => {
  e.preventDefault();
  const producto = document.getElementById("producto").value;
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const clienteId = parseInt(document.getElementById("cliente").value);

  if (producto && cantidad && clienteId) {
    agregarPedido(clienteId, producto, cantidad);
    formPedidos.reset();
  } else {
    alert("Por favor, completa todos los campos del pedido.");
  }
});

// ==========================
// CARGAR CLIENTES EN SELECT
// ==========================
function cargarClientesEnSelect() {
  listarClientes((clientes) => {
    const select = document.getElementById("cliente");
    select.innerHTML = ""; // limpiar antes de volver a llenar

    if (clientes.length === 0) {
      const option = document.createElement("option");
      option.textContent = "Sin clientes disponibles";
      select.appendChild(option);
      return;
    }

    clientes.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente.id;
      option.textContent = cliente.nombre;
      select.appendChild(option);
    });
  });
}
