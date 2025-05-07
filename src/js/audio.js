import * as THREE from "three";

export function setupBackgroundAudio(camera, scene, gui) {
  const audioListener = new THREE.AudioListener();
  camera.add(audioListener);

  const space = new THREE.Audio(audioListener);
  scene.add(space);

  const loader = new THREE.AudioLoader();
  loader.load("./audios/space.mp3", (buffer) => {
    space.setBuffer(buffer);
    space.setLoop(true);
    space.setVolume(0.01);

    // Play audio or not
    const controls = {
      toggleAudio: () => {
        if (space.isPlaying) {
          space.pause();
        } else {
          space.play();
        }
      },
    };

    gui.add(controls, "toggleAudio").name("Audio control");
  });
}
