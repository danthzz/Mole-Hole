import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { MoodBad } from '@material-ui/icons';
import 'mapbox-gl/dist/mapbox-gl.css';
import { format } from 'date-fns'
import axios from 'axios';

import Sigin from './componentes/sigin';
import Login from './componentes/login';
import imge from './assets/311532.png';
import '../src/app.css';

function App() {
  const myStorage = window.localStorage;
  const [currentUser, setCurrentUser] = useState(myStorage.getItem('user'));
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState();
  const [title, setTitle] = useState();
  const [desc, setDesc] = useState();
  const [rating, setRating] = useState();
  const [showSigin, setShowSigin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPin, setSelectedPin] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deletingPinId, setDeletingPinId] = useState(null);

  const [viewState, setViewState] = useState({
    latitude: -19.618797554510653,
    longitude: -44.040495757661276,
    zoom: 14
  });
  const [isPopupClosed, setIsPopupClosed] = useState(false); // estado para controlar o fechamento do Popup

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewState({
            latitude,
            longitude,
            zoom: 15
          });
        },
        (error) => {
          console.log('Error getting user location:', error);
          // Se ocorrer um erro ao obter a localização do usuário, você pode fornecer as coordenadas padrão aqui.
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      // Se a geolocalização não for suportada pelo navegador, você pode fornecer as coordenadas padrão aqui.
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("/pins");
        setPins(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleMarkerClick = (id, lat, long) => {
    const selectedPin = pins.find(pin => pin._id === id);
    setSelectedPin(selectedPin);
    setCurrentPlaceId(id);
    setViewState({ ...viewState, latitude: lat, longitude: long });
  };


  const handleAddClick = (e) => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
  
    const { lng, lat } = e.lngLat;
    setNewPlace({ lat, lng });
    setViewState({ ...viewState, latitude: lat, longitude: lng });
  };
  

  const handlePopupClose = () => {
    setNewPlace(null);
    setCurrentPlaceId(null);
    setEditMode(null);
    setIsPopupClosed(true); // Define o estado de fechamento do Popup como verdadeiro
  };

  useEffect(() => {
    if (isPopupClosed) {
      setIsPopupClosed(false); // Re-renderiza a pagina sempre que o popup é fechado para nao impedir que ele seja aberto logo após
    }
  }, [isPopupClosed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating,
      lat: newPlace.lat,
      long: newPlace.lng
    }

    try {
      const res = await axios.post("/pins", newPin)
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err)
    }
  };

  const handleEdit = async () => {
    const editPin = {
      title,
      desc,
      rating,
      lat: selectedPin.lat,
      long: selectedPin.lng
    }

    try {
      const res = await axios.put(`/pins/${currentPlaceId}`, editPin);
      const updatedPin = res.data;
      setPins(pins.map(pin => pin._id === currentPlaceId ? updatedPin : pin));
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };


  const handleDelete = (id) => {
    setShowConfirmation(true);
    setDeletingPinId(id);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/pins/${deletingPinId}`);
      setPins(pins.filter(pin => pin._id !== deletingPinId));
      alert("Marcador excluído com sucesso!");
    } catch (err) {
      console.log(err);
    }
    setShowConfirmation(false);
    setDeletingPinId(null);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setDeletingPinId(null);
  };


  const handleLogout = () => {
    myStorage.removeItem("user");
    setCurrentUser(null)
  }


  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100vw', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken={process.env.REACT_APP_MAPBOX}
      onDblClick={handleAddClick}
      onContextMenu={handleAddClick}
      doubleClickZoom={false}
      cursor={'auto'}
    >
      {pins.map((p) => (
        <>
          <Marker
            latitude={p.lat}
            longitude={p.long}
            onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
          >
            <img src={imge} width={35} alt="Marker" style={{ cursor: 'pointer' }} />
          </Marker>
          {p._id === currentPlaceId && (
            <Popup
              key={p._id}
              latitude={p.lat}
              longitude={p.long}
              anchor="left"
              closeOnClick={false}
              closeButton={true}
              onClose={handlePopupClose}
            >
              <div className="card">
                <label>Titulo:</label>
                <p className="place">{p.title}</p>
                <label>Resumo:</label>
                <p>{p.desc}</p>
                <label>Tamanho:</label>
                <div>
                  {Array(p.rating).fill(<MoodBad className="rtng" />)}
                </div>
                <label>Infos:</label>
                <p className="username">
                  Criado por <b>{p.username}</b>
                </p>
                {p.createdAt === p.updatedAt ?
                  (<p className="date"> Desde: <b>{format(new Date(p.createdAt), 'dd/MM/yy - HH:mm')}</b>{/* formatar a data de criação */}</p>)
                  :
                  (<div>
                    <p className="date"> Criado em: <b>{format(new Date(p.createdAt), 'dd/MM/yy - HH:mm')}</b>{/* formatar a data de criação */}</p>
                    <p className="date"> Atualizado em: <b>{format(new Date(p.updatedAt), 'dd/MM/yy - HH:mm')}</b>  {/* formatar a data de criação */}</p>
                  </div>)
                }
                <>
                  {currentUser === p.username && (
                    <div className='btnsUD'>
                      <button className='edit' onClick={() => { handleEdit(p._id); setEditMode(true); }}>
                        Editar
                      </button>

                      <button className='del' onClick={() => handleDelete(p._id)}>
                        Excluir
                      </button>
                    </div>
                  )}
                </>
              </div>
            </Popup>
          )}
        </>
      ))}
      {showConfirmation && deletingPinId && (
        <Popup
          key={deletingPinId}
          latitude={pins.find(pin => pin._id === deletingPinId)?.lat}
          longitude={pins.find(pin => pin._id === deletingPinId)?.long}
          anchor="left"
          closeOnClick={false}
          closeButton={true}
          onClose={handlePopupClose}
        >
          <div className="confirmCont">
            <span className='confirmTitle'>Você deseja excluir esse marcador?</span>
            <div className="confirmBtns">
              <button className='confirmBtn s' onClick={confirmDelete}>Sim</button>
              <button className='confirmBtn n' onClick={cancelDelete}>Não</button>
            </div>
          </div>
        </Popup>
      )}
      {newPlace &&(
        <Popup
          latitude={newPlace.lat}
          longitude={newPlace.lng}
          anchor="left"
          closeOnClick={true}
          closeButton={true}
          onClose={handlePopupClose}
        >
          <form onSubmit={handleSubmit}>
            <label>Titulo</label>
            <input
              placeholder="Adcione um titulo"
              onChange={(e) => setTitle(e.target.value)}
            />

            <label>Descrição</label>
            <textarea
              placeholder="Adcione uma descrição do local"
              onChange={(e) => setDesc(e.target.value)}
            />
            <label>Tamanho</label>
            <select onChange={(e) => setRating(e.target.value)}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            <button className="submitBtn" type="submit"> Adcionar Buraco</button>
          </form>
        </Popup>
      )}

      {editMode && (
        <Popup
          latitude={selectedPin.lat}
          longitude={selectedPin.long}
          anchor="left"
          closeOnClick={true}
          closeButton={true}
          onClose={handlePopupClose}
        >
          <form onSubmit={handleEdit}>
            <label>Titulo</label>
            <input
              placeholder="Adcione um titulo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label>Descrição</label>
            <textarea
              placeholder="Adcione uma descrição do local"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <label>Tamanho</label>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            <button className="submitBtn" type="submit">
              Atualizar Marcador
            </button>
          </form>
        </Popup>
      )}

      {currentUser ?
        (<button className='btn logout' onClick={handleLogout}>Sair</button>)
        :
        (
          <div className='btns'>
            <button className='btn login' onClick={() => setShowLogin(true)}>Entrar</button>
            <button className='btn sigin' onClick={() => setShowSigin(true)}>Registrar-se</button>
          </div>
        )}
      {showSigin && (
        <Sigin setShowSigin={setShowSigin} />
      )}
      {showLogin && (
        <Login
          setShowLogin={setShowLogin}
          myStorage={myStorage}
          setCurrentUser={setCurrentUser}
        />
      )}
    </Map>
  );
}

export default App;
