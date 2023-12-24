//HEADER
document.addEventListener('DOMContentLoaded', function() {
  // Configuración del carrusel
  $('#imageCarousel').carousel();

  // Manejar el envío del formulario de sugerencias
  document.getElementById('suggestionForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const suggestion = document.getElementById('suggestion').value;

    // Guardar la sugerencia en IndexedDB
    saveSuggestionToIndexedDB(suggestion);

    // Limpiar el formulario
    document.getElementById('suggestion').value = '';
  });

  // Función para guardar sugerencias en IndexedDB
  function saveSuggestionToIndexedDB(suggestion) {
    const request = indexedDB.open('suggestionsDB', 1);

    request.onerror = function(event) {
      console.error('Error al abrir la base de datos:', event.target.errorCode);
    };

    request.onupgradeneeded = function(event) {
      const db = event.target.result;
      db.createObjectStore('suggestions', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['suggestions'], 'readwrite');
      const objectStore = transaction.objectStore('suggestions');

      const suggestionObject = { suggestion: suggestion, timestamp: new Date().getTime() };
      const request = objectStore.add(suggestionObject);

      request.onsuccess = function() {
        console.log('Sugerencia almacenada en IndexedDB:', suggestionObject);
      };

      request.onerror = function() {
        console.error('Error al almacenar la sugerencia en IndexedDB.');
      };
    };
  }
});
//










//FOOTER

// Abrir o crear una base de datos
var request = indexedDB.open('comentariosDB', 1);

// Manejar el evento de actualización de la base de datos
request.onupgradeneeded = function(event) {
  var db = event.target.result;

  // Crear un almacén de objetos (object store) en la base de datos
  var objectStore = db.createObjectStore('comentarios', { keyPath: 'id', autoIncrement: true });

  // Crear un índice para buscar por fecha
  objectStore.createIndex('fecha', 'fecha', { unique: false });
};

// Manejar el evento de éxito al abrir la base de datos
request.onsuccess = function(event) {
  var db = event.target.result;

  // Manejar el envío del formulario
  var form = document.getElementById('commentForm');
  form.addEventListener('submit', function(event) {
    event.preventDefault();

    var commentText = document.getElementById('commentText').value;

    // Realizar operaciones en la base de datos
    var transaction = db.transaction(['comentarios'], 'readwrite');
    var objectStore = transaction.objectStore('comentarios');

    // Agregar un comentario al almacén
    var comment = { texto: commentText, fecha: new Date() };
    var request = objectStore.add(comment);

    // Manejar el evento de éxito al agregar el comentario
    request.onsuccess = function(event) {
      console.log('Comentario agregado correctamente');
      document.getElementById('commentText').value = '';
     
      mostrarComentariosFooter();
    };

    // Cerrar la transacción
    transaction.oncomplete = function(event) {
      console.log('Transacción completada');
    };
  });

  // Mostrar los comentarios almacenados
  function mostrarComentarios() {
    var commentList = document.getElementById('commentList');
    commentList.innerHTML = '';

    var objectStore = db.transaction('comentarios').objectStore('comentarios');
    objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        var comment = cursor.value;
        var commentRow = document.createElement('div');
        commentRow.classList.add('comment-row');
        commentRow.innerHTML = `
          <div class="comment-text">${comment.texto}</div>
          <div class="comment-buttons">
            <button class="btn btn-danger" onclick="eliminarComentario(${comment.id})">Eliminar</button>
            <button class="btn btn-primary" onclick="editarComentario(${comment.id})">Editar</button>
          </div>
        `;
        commentList.appendChild(commentRow);
        cursor.continue();
      }
    };
  }

  // Mostrar los comentarios en el footer
  function mostrarComentariosFooter() {
    var footerCommentList = document.getElementById('footerCommentList');
    footerCommentList.innerHTML = '';

    var objectStore = db.transaction('comentarios').objectStore('comentarios');
    objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        var comment = cursor.value;
        var commentCol = document.createElement('div');
        commentCol.classList.add('col-md-4');
        commentCol.innerHTML = `
          <div class="card">
            <div class="card-body">
              <p class="card-text">${comment.texto}</p>
              <button class="btn btn-danger" onclick="eliminarComentario(${comment.id})">Eliminar</button>
              <button class="btn btn-primary" onclick="editarComentario(${comment.id})">Editar</button>
            </div>
          </div>
        `;
        footerCommentList.appendChild(commentCol);
        cursor.continue();
      }
    };
  }

  // Eliminar un comentario
  window.eliminarComentario = function(id) {
    var transaction = db.transaction(['comentarios'], 'readwrite');
    var objectStore = transaction.objectStore('comentarios');
    var request = objectStore.delete(id);

    request.onsuccess = function(event) {
      console.log('Comentario eliminado correctamente');
     /* mostrarComentarios();*/
      mostrarComentariosFooter();
    };

    transaction.oncomplete = function(event) {
      console.log('Transacción completada');
    };
  };

  // Editar un comentario
  window.editarComentario = function(id) {
    var nuevoTexto = prompt('Ingrese el nuevo texto del comentario:');
    if (nuevoTexto) {
      var transaction = db.transaction(['comentarios'], 'readwrite');
      var objectStore = transaction.objectStore('comentarios');
      var getRequest = objectStore.get(id);

      getRequest.onsuccess = function(event) {
        var comment = event.target.result;
        comment.texto = nuevoTexto;
        var updateRequest = objectStore.put(comment);

        updateRequest.onsuccess = function(event) {
          console.log('Comentario actualizado correctamente');
         
          mostrarComentariosFooter();
        };
      };

      transaction.oncomplete = function(event) {
        console.log('Transacción completada');
      };
    }
  };

  /*mostrarComentarios();*/
  mostrarComentariosFooter();
};

// Manejar el evento de error al abrir la base de datos
request.onerror = function(event) {
  console.error('Error al abrir la base de datos:', event.target.error);
};
