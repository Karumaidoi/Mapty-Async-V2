'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Class App to hold our app logic
// Properties [map, MapEvent, Friends]
// Constructor [getPosition, getFriends, and load a map]

class App {
  #map;
  #mapEvent;
  #friends;

  constructor() {
    this._getPosition();

    this._getFriends();

    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  async _getFriends() {
    const res = await fetch(`https://fakestoreapi.com/users`);

    const data = await res.json();
    console.log(data);

    this.#friends = data;

    this.#friends.forEach(friend => this._renderWorkOut(friend));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          console.log('Something happended');
        }
      );
    }
  }

  _loadMap(position) {
    const { longitude, latitude } = position.coords;
    console.log(longitude, latitude);

    this.#map = L.map('map').setView([latitude, longitude], 3);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#friends?.forEach(friend => {
      this._renderWorkOutMarker(friend);
    });
  }

  _renderWorkOutMarker(friend) {
    let { lat, long } = friend.address.geolocation;
    const coords = [lat, long];
    L.marker(coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          maxHeight: 250,
          autoClose: false,
          closeOnClick: false,
          className: `running-popup`,
        })
      )
      .setPopupContent(`${friend.email}`)
      .openPopup();
  }

  _renderWorkOut(friend) {
    let html = `<li class="workout workout--${
      friend.id % 2 === 0 ? 'running' : 'cycling'
    }" data-id=${friend.id}>
          <h2 class="workout__title">${friend?.name.firstname} ${
      friend.name.lastname
    }</h2>
          <div class="workout__details">
            
            <span class="workout__value">${friend?.phone}</span>
            <span class="workout__unit">km</span>
          </div>
          `;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const friend = this.#friends.find(work => work.id == workoutEl.dataset.id);

    let { lat, long } = friend.address.geolocation;
    const coords = [lat, long];

    this.#map.setView(coords, 5, {
      animate: true,
      pan: { duration: 1 },
    });
  }
}

const app = new App();
