import { collection, doc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import React, { useState, useEffect } from 'react';
import { db } from './Firebase';


function generarToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function App() {
  const [cliente, setCliente] = useState({ nombre: '', telefono: '', puntos: 0, token: '' ,reclamados: [],});
  const [registrado, setRegistrado] = useState(false);
const [premios, setPremios] = useState([]);


// Cargar premios desde Firebase al iniciar
const cargarPremios = async () => {
  const snapshot = await getDocs(collection(db, 'premios'));
  const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  setPremios(lista);
};




  // Al montar el componente, revisamos si hay cliente guardado
useEffect(() => {
  const telefonoGuardado = localStorage.getItem('clienteRegistrado');
  if (premios.length === 0) {
    cargarPremios();
    console.log('Cargando premios...');
  }
  
  
  
  if (telefonoGuardado) {

    const unsubscribe = onSnapshot(doc(db, 'clientes', telefonoGuardado), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCliente(data);
        setRegistrado(true);
        localStorage.setItem(telefonoGuardado, JSON.stringify(data));
      } else {
        console.warn('Cliente no encontrado en Firebase');
        setRegistrado(false);
      }
    });

    return () => unsubscribe(); // limpiamos el listener cuando se desmonta el componente
  }
}, []);



  const guardarCliente = async () => {
    const id = cliente.telefono.trim();
    if (!id || !cliente.nombre.trim()) return alert('Completa todos los campos');

    const token = generarToken(); // generamos token único
    const nuevoCliente = { ...cliente, puntos: 0, token ,reclamados: []};

    localStorage.setItem(id, JSON.stringify(nuevoCliente));
    localStorage.setItem('clienteRegistrado', id); // Guardamos el teléfono
    setCliente(nuevoCliente);
    setRegistrado(true);

    try {
      await setDoc(doc(db, 'clientes', id), nuevoCliente);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

 
 
 
 
 
  const borrarDatosLocales = () => {
    localStorage.clear();
    setCliente({ nombre: '', telefono: '', puntos: 0, token: '' });
    setRegistrado(false);
  };








  return (
   
   
   <section className="bodyp">

   
     <img
            className='logodellocal'
            src="https://res.cloudinary.com/db8e98ggo/image/upload/v1752169496/459036700_122101501928513503_3142647657257802548_n_thnzj7.jpg"
            alt="Logo"
          />

   <div className="contenedorcomo">
      {!registrado ? (
        <>
        <p className="titulo">Como funciona</p>
        <p>1. Completa tus datos.</p>
        <p>2. Recibe tu tarjeta de fidelidad gratis.</p>
        <p>3. Acumula puntos por cada compra.</p>
        <p>4. Canjea tus puntos por premios.</p>

        {premios.length > 0 && (
  <div className="premios">
    <h3>Premios Disponibles</h3>
    <ul>
      {premios.map((premio) => {
      
        return (
          <li
            key={premio.id}
          >
            <div>
              
              <p>{premio.nombre} </p> 
         
            </div>
          </li>
        );
      })}
    </ul>
 
  </div>
)}

</>
      ) 
      : 
      (
    <section>
      <div>
        Cada dolara gastado equivale a 100 puntos.
      </div>



    </section>
      )
      }

  







    </div>
  



   <div className="contenedor">
      {!registrado ? (
        <>
        <p className="titulo">Crea tu tarjeta de fidelidad</p>
          <input
            placeholder="Nombre"
            value={cliente.nombre}
            onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
          />
          <input
            placeholder="Teléfono"
            value={cliente.telefono}
            onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
          />
          <button onClick={guardarCliente}>Crear Tarjeta</button>
        </>
      ) 
      : (
        <div className="qr-area">
          <h2>¡Felisidades {cliente.nombre}  tu tarjeta está lista!</h2>
          <p><strong>Puntos:</strong> {cliente.puntos}</p>
       <QRCodeSVG
  size={200}
  value={`${cliente.telefono}|${cliente.token}`}
/>

          <p>Muéstralo en el local para sumar tus punotos</p>
        </div>
      )}

  



{registrado && premios.length > 0 && (
  <div className="premios">
    <h3>Premios Disponibles</h3>
    <ul>
      {premios.map((premio) => {
        const yaReclamado = cliente.reclamados.includes(premio.nombre);

        return (
          <li
            key={premio.id}
            style={{
        
              opacity: yaReclamado ? 0.5 : 1,
              border: yaReclamado ? '1px solid red' : 'none',
            
            }}
          >
            <div>
              <p>{premio.nombre} - {premio.costo} puntos   </p> 
              {yaReclamado && (
                <p style={{ color: 'red' }}>Ya reclamado</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
 
  </div>
)}






    </div>
  

   </section>

);
}

export default App;
