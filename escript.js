
let db;
const request = indexedDB.open("miTiendaDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;



  if (!db.objectStoreNames.contains("clientes")) {
    const clientesStore = db.createObjectStore("clientes", { keyPath: "id", autoIncrement: true });
    clientesStore.createIndex("nombre", "nombre", { unique: false });
    clientesStore.createIndex("ci", "ci", { unique: true });
  }

  



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

  
  cargarClientesEnSelect();
  mostrarClientes();
  mostrarPedidos()
};

request.onerror = function (event) {
  console.error("❌ Error al abrir la base de datos:", event.target.error);
};





function agregarCliente(nombre, ci) {
  const tx = db.transaction("clientes", "readwrite");
  const store = tx.objectStore("clientes");
  store.add({ nombre, ci });
  tx.oncomplete = () => {
    console.log("Cliente agregado:", nombre);
    cargarClientesEnSelect(); 
  };
  tx.onerror = (e) => console.error("Error al agregar cliente:", e.target.error);
}


function listarClientes(callback) {
  const tx = db.transaction("clientes", "readonly");
  const store = tx.objectStore("clientes");
  const request = store.getAll();

  request.onsuccess = function () {
    callback(request.result);
  };
}





function agregarPedido(clienteId, producto, cantidad) {
  const tx = db.transaction("pedidos", "readwrite");
  const store = tx.objectStore("pedidos");
  store.add({ clienteId, producto, cantidad });
  tx.oncomplete = () => console.log("Pedido agregado para cliente ID:", clienteId);
}


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



function mostrarClientes() {
  const contenedor = document.getElementById("listaClientes");
  contenedor.innerHTML = "<h3>Lista de Clientes</h3>";

  const tx = db.transaction("clientes", "readonly");
  const store = tx.objectStore("clientes");
  const request = store.openCursor();

  request.onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      const cliente = cursor.value;
      const div = document.createElement("div");
      div.classList.add("registro");
      div.innerHTML = `
        <strong>${cliente.nombre}</strong> (CI: ${cliente.ci}) 
        <button onclick="eliminarCliente(${cliente.id})">🗑️</button>
      `;
      contenedor.appendChild(div);
      cursor.continue();
    }

    if (!contenedor.querySelector(".registro")) {
      contenedor.innerHTML += "<p><em>No hay clientes registrados.</em></p>";
    }
  };
}




function mostrarPedidos() {
  const tbody = document.querySelector("#tablaPedidos tbody");
  tbody.innerHTML = "";

  const tx = db.transaction("pedidos", "readonly");
  const store = tx.objectStore("pedidos");
  const request = store.openCursor();

  request.onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      const pedido = cursor.value;

      // Obtenemos el nombre del cliente asociado
      const clienteTx = db.transaction("clientes", "readonly");
      const clienteStore = clienteTx.objectStore("clientes");
      const clienteRequest = clienteStore.get(pedido.clienteId);

      clienteRequest.onsuccess = () => {
        const cliente = clienteRequest.result ? clienteRequest.result.nombre : "Desconocido";

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td><input type="text" value="${pedido.producto}" data-id="${pedido.id}" class="edit-producto"></td>
          <td><input type="number" value="${pedido.cantidad}" class="edit-cantidad" min="1"></td>
          <td>${cliente}</td>
          <td>
            <button class="actualizar" onclick="actualizarPedido(${pedido.id}, this)">Actualizar</button>
            <button class="eliminar" onclick="eliminarPedido(${pedido.id})">Borrar</button>
          </td>
        `;
        tbody.appendChild(fila);
      };

      cursor.continue();
    } else if (!tbody.hasChildNodes()) {
      tbody.innerHTML = `<tr><td colspan="4"><em>No hay pedidos registrados</em></td></tr>`;
    }
  };
}




function mostrarPedidos() {
  const contenedor = document.getElementById("listaPedidos");
  contenedor.innerHTML = "<h3>Lista de Pedidos</h3>";

  const tx = db.transaction("pedidos", "readonly");
  const store = tx.objectStore("pedidos");
  const request = store.openCursor();

  request.onsuccess = (e) => {
    const cursor = e.target.result;
    if (cursor) {
      const pedido = cursor.value;
      const div = document.createElement("div");
      div.classList.add("registro");
      div.innerHTML = `
        <strong>${pedido.producto}</strong> - Cantidad: ${pedido.cantidad} <br>
        Cliente ID: ${pedido.clienteId}
        <button onclick="eliminarPedido(${pedido.id})">🗑️</button>
      `;
      contenedor.appendChild(div);
      cursor.continue();
    }

    if (!contenedor.querySelector(".registro")) {
      contenedor.innerHTML += "<p><em>No hay pedidos registrados.</em></p>";
    }
  };
}



function eliminarCliente(id) {
  const tx = db.transaction("clientes", "readwrite");
  const store = tx.objectStore("clientes");
  store.delete(id);
  tx.oncomplete = () => {
    console.log("Cliente eliminado:", id);
    mostrarClientes();
    cargarClientesEnSelect();
  };
}


function eliminarPedido(id) {
  const tx = db.transaction("pedidos", "readwrite");
  const store = tx.objectStore("pedidos");
  store.delete(id);
  tx.oncomplete = () => {
    console.log("Pedido eliminado:", id);
    mostrarPedidos();
  };
}




