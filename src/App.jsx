import { collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
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
  'https://res.cloudinary.com/db8e98ggo/image/upload/v1752506891/PROMO_VIE_SAB_CORONA_tpppbk.png',
  'https://res.cloudinary.com/db8e98ggo/image/upload/v1752506892/PROMO_MIE_JUE_MARGARITAS_ktxupl.png',
  'https://res.cloudinary.com/db8e98ggo/image/upload/v1752506892/PROMO_MARTES_MOJITO_hkn7yk.png',
  'https://res.cloudinary.com/db8e98ggo/image/upload/v1752529498/DECIMO_COCTEL_GRATIS_wcct2v.png',
  'https://res.cloudinary.com/db8e98ggo/image/upload/v1752529499/HAPPY_HOUR_n1esqx.png',
  'https://res.cloudinary.com/db8e98ggo/image/upload/v1752529499/DECIMO_CAFE_GRATIS_qcbcaa.png',
   
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


const [mensajeInfo, setMensajeInfo] = useState('');



const guardarCliente = async () => {
  const id = cliente.telefono.trim();
  if (!id || !cliente.nombre.trim()) {
    setMensajeInfo('Por favor completa todos los campos.');
    return;
  }

  try {
    const docRef = doc(db, 'clientes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setCliente(data);
      console.log('Cliente ya registrado:', data);
      
      setRegistrado(true);
      localStorage.setItem(id, JSON.stringify(data));
      localStorage.setItem('clienteRegistrado', id);
      setMensajeInfo(`Hola de nuevo, ${data.nombre}. Ya tienes una tarjeta registrada y hemos cargado tus datos.`);
    } else {
      const token = generarToken();
      const nuevoCliente = {
        ...cliente,
        puntos: 0,
        token,
        reclamados: [],
      };

      await setDoc(docRef, nuevoCliente);
      setCliente(nuevoCliente);
      setRegistrado(true);
      localStorage.setItem(id, JSON.stringify(nuevoCliente));
      localStorage.setItem('clienteRegistrado', id);
      setMensajeInfo('¡Tu tarjeta ha sido creada con éxito!');
    }
  } catch (error) {
    console.error('Error al verificar o guardar cliente:', error);
    setMensajeInfo('Hubo un error al guardar tu tarjeta. Intenta nuevamente.');
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

<p
className='txtoinixcal'
>
  Premiamos tu amor por   lo delicioso y lindo de Cuenca</p>

   <div className="contenedorcomo">
      {!registrado ? (
        <>
        <p className="titulo">¿Como funciona?</p>
       
       <div className="contenedorcomotexto">

        <p  className='cmotex'  >1. Completa tus datos.</p>
        <p className='cmotex'  >2. Recibe tu tarjeta de fidelidad gratis.</p>
        <p className='cmotex'  >3. Acumula puntos por cada compra.</p>
        <p className='cmotex'  >4. Canjea tus puntos por premios.</p>

       </div>
        {premios.length > 0 && (
  <div className="premios">
    <p className='premiosh3'  >Premios Disponibles</p>
    <ul>
      {premios.map((premio) => {
      
        return (
          <li
            key={premio.id}
          >
           
              
              <p  className='itempreitext' >{premio.nombre} </p> 
         
           
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
      {!registrado ? 
      (
        <section className="formulario">
        <p className="titulocra">Crea tu tarjeta </p>
         <p
className='txtocratarjr'
>
  Y recibe premios por tu fidelidad</p>

         
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
      :
      (
      
      
      <div className="qr-area">
   
   <div className="datodcleite">
  <h2 className="tulotarjeta">
    ¡Felicidades <span className="tulotarjetanombreclite">{cliente.nombre}</span>, tu tarjeta está lista!
  </h2>
</div>



          <div  className='CONTEPUTOS' >

          <p className='punotstext'    >   <strong>Puntos:</strong></p>
          <p className='puntosttes'    >{cliente.puntos}</p>
       
          </div>
       
       <QRCodeSVG
  size={150}
 fgColor="#8b4513"
  value={`${cliente.telefono}|${cliente.token}`}
/>

          <p className='intrusicnparamas'   >Muéstralo en el local para sumar tus puntos</p>
      
      
      </div>
      
      
      
      )}

  



{registrado && premios.length > 0 && (
  <div className="premios">
    <h3 className='premiosh3'  >Premios Disponibles</h3>
    <ul>
      {premios.map((premio) => {
        const yaReclamado = cliente.reclamados.includes(premio.nombre);

        return (
          <li
            key={premio.id}
            style={{
        
              opacity: yaReclamado ? 0.5 : 1,
              border: yaReclamado ? '1px solid #913028' : 'none',
              backgroundColor: yaReclamado ? '#f8d7da' : '#8b4513',
              color: yaReclamado ? '#000000ff' : '#f8eed6',
            }}
          >
            <div>
              <p  className='texpremio' >{premio.nombre}  {premio.costo} puntos   </p> 
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











<div className="foo"   >
  
</div>

   </section>

);
}

export default App;
