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





const fotospormod = [
  'https://res.cloudinary.com/db8e98ggo/image/upload/v1752427693/3_lsvlwn.png',
  'https://res.cloudinary.com/db8e98ggo/image/upload/v1752427693/2_qw9pxm.png',
  'https://res.cloudinary.com/db8e98ggo/image/upload/v1752427695/4_nkc2uq.png',
  'https://res.cloudinary.com/db8e98ggo/image/upload/v1752427692/1_b84kdf.png',
   
]


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
  
   console.log('Teléfono guardado:', telefonoGuardado);
    


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
            src="https://res.cloudinary.com/db8e98ggo/image/upload/v1752425938/Dise%C3%B1o_sin_t%C3%ADtulo_1_kutm4q.png"
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
    <h3     >Premios Disponibles</h3>
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
        Cada $5 equivale a 100 puntos.
      </div>



    </section>
      )
      }

  







    </div>
  



   <div className="contenedor">
      {!registrado ? (
        <section className="formulario">
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
        </section>
      ) 
      : (
        <div className="qr-area">
   <div className="datodcleite">
  <h2 className="tulotarjeta">
    ¡Felicidades <span className="tulotarjetanombreclite">{cliente.nombre}</span> tu tarjeta está lista!
  </h2>
</div>



          <div  className='CONTEPUTOS' >

          <p className='punotstext'    >   <strong>Puntos:</strong></p>
          <p className='puntosttes'    >{cliente.puntos}</p>
       
          </div>
       
       <QRCodeSVG
  size={200}
 fgColor="#8b4513"
  value={`${cliente.telefono}|${cliente.token}`}
/>

          <p className='intrusicnparamas'   >Muéstralo en el local para sumar tus puntos</p>
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
              border: yaReclamado ? '1px solid #913028' : 'none',
            
            }}
          >
            <div>
              <p>{premio.nombre} - {premio.costo} puntos   </p> 
              {yaReclamado && (
                <p style={{ color: '#913028' }}>Ya reclamado</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
 
  </div>
)}






    </div>
  





  <div className="carrusel-container">
     <h2 className='tulotarjetas'   >Disfruta también de nuestras promociones</h2>
      <div
        className="carrusel-slider"
      >
        {fotospormod.map((foto, i) => (
          <img key={i} src={foto} alt={`foto-${i}`} className="carrusel-img" />
        ))}
      </div>
    </div>













   </section>

);
}

export default App;
