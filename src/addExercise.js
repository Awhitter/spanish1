const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ejerciciosPath = './src/data/ejercicios.json';

function addExercise() {
  let newExercise = {};

  rl.question('Ingrese la pregunta: ', (pregunta) => {
    newExercise.pregunta = pregunta;

    rl.question('Ingrese la respuesta: ', (respuesta) => {
      newExercise.respuesta = respuesta;

      fs.readFile(ejerciciosPath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error al leer el archivo:', err);
          rl.close();
          return;
        }

        const ejercicios = JSON.parse(data);
        ejercicios.push(newExercise);

        fs.writeFile(ejerciciosPath, JSON.stringify(ejercicios, null, 2), 'utf8', (err) => {
          if (err) {
            console.error('Error al escribir en el archivo:', err);
          } else {
            console.log('Ejercicio agregado con éxito.');
          }
          rl.close();
        });
      });
    });
  });
}

addExercise();