const API_URL = `${location.protocol}//${window.SERVER_HOST}`;

export function createGame() {
  return fetch(`${API_URL}/game`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => res.json());
}

export function checkGame(code: string) {
  return fetch(`${API_URL}/game/check/${code}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => res.json());
}