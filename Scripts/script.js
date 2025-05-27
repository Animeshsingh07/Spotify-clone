var current = new Audio(); //<Now Playing
let songs;
let currentsongindex = -1;
let volume = document.querySelector(".volume");
let currentvolume=1;

//

//updating duration of the currently playing song
const willplay = document.querySelector(".willplay");
current.addEventListener("loadeddata", () => {
  if (!isNaN(current.duration)) {
    willplay.innerHTML = `${time(current.duration)}`;
  }
});

//updating playtime of the currently playing song
const played = document.querySelector(".played");
const seek = document.querySelector(".seek");
seek.disabled = true;
current.addEventListener("timeupdate", () => {
  if (!isNaN(current.currentTime) && !isNaN(current.duration)) {
    played.innerHTML = `${time(current.currentTime)}`;
    const percentage = (current.currentTime / current.duration) * 100;
    seek.value = percentage;
    updateslider(seek, percentage);
  }
});

current.addEventListener("ended", () => {
  setTimeout(() => {
    if (currentsongindex < songs.length - 1) {
      currentsongindex++;
      playing(songs[currentsongindex]);
    } else {
      currentsongindex = 0;
      playing(songs[currentsongindex]);
    }
  }, 1500);
});

// updating the seekbar
document.querySelector(".seek").addEventListener("input", (e) => {
  const value = e.currentTarget.value;
  current.currentTime = (value * current.duration) / 100;
});

//updates slider
function updateslider(slider, percentage) {
  slider.style.background = `linear-gradient(to right, #1db954 ${percentage}%, #555 ${percentage}%)`;
}

//volumeslider
document.querySelector(".volume").addEventListener("input", (e) => {
  const value = parseFloat(e.currentTarget.value);
  const min = parseFloat(e.currentTarget.min);
  const max = parseFloat(e.currentTarget.max);
  const percentage = ((value - min) / (max - min)) * 100;
  const level = percentage / 100;  
  current.volume = level;
  currentvolume = current.volume;
  updateslider(volume, current.volume*100);
});
//<volumeslider

async function getSongs() {
  //extracting songs
  let tracks = await fetch("http://127.0.0.1:5500/Files/Songs/");
  let response = await tracks.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  //For storing Song images
  //extracting album covers
  let tnails = await fetch("http://127.0.0.1:5500/Files/Thumbnails/");
  response = await tnails.text();
  let tdiv = document.createElement("div");
  tdiv.innerHTML = response;
  let img_a = tdiv.getElementsByTagName("a");
  let thumbnails = [];

  for (let index = 0; index < img_a.length; index++) {
    const element = img_a[index];
    if (element.href.endsWith(".jpg") || element.href.endsWith(".jpeg")) {
      thumbnails.push({
        name: element.title.split(".")[0],
        address: element.href,
      });
    }
  }
  //<For storing Song images

  //For storing Song details
  let ans = div.getElementsByTagName("a");
  let songlist = [];

  for (let i = 0; i < ans.length; i++) {
    const element = ans[i];

    if (element.href.endsWith(".mp3") || element.href.endsWith(".flac")) {
      let songimage =
        "https://t.scdn.co/images/728ed47fc1674feb95f7ac20236eb6d7.jpeg";

      for (let j = 0; j < thumbnails.length; j++) {
        const el = thumbnails[j];
        if (element.title.toLowerCase().includes(el.name.toLowerCase())) {
          songimage = el.address;
        }
      }
      songlist.push({
        image: songimage,
        name: element.title.split(".")[0],
        address: element.href,
      });
    }
  }
  //<For storing Song details
  return songlist;
}

//Conversion of seconds to minutes and formatting
function time(time) {
  let duration = Math.floor(time);
  let min = Math.floor(duration / 60);
  let sec = duration % 60;
  sec = sec < 10 ? "0" + sec : sec;
  return min + ":" + sec;
}

//Playing Now
const playing = (song) => {
  currentsong = song;
  current.src = song.address;
  current.play();
  playimg.src = "Icons/pause.svg";
  seek.disabled = false;
  //Updating the Current playing song on the PlayBar
  document.querySelector(".playing").innerHTML = `<img src="${
    song.image
  }" alt="">
  <div class="currentsong">
                <div class="currentsongtitle">
                ${song.name.split("-")[0]}
                </div>
                <div class="currentsonginfo">
                ${song.name.split("-")[1]}
                </div>
            </div>`;
};
//<Playing now

//IIFE - Immediately Invoked Function Expression
(async function main() {
  //getting all the songs
  songs = await getSongs();

  //updating the cards for all the songs
  let songcard = document.querySelector(".cardcontainer");
  songs.forEach((song, index) => {
    songcard.innerHTML += `<div class="card" data-index="${index}">
            <img
              class="cardimg"
              src="${song.image}"
              alt="https://t.scdn.co/images/728ed47fc1674feb95f7ac20236eb6d7.jpeg"
            />
            <span>${song.name.split("-")[0]}</span>
            <p>${song.name.split("-")[1]}</p>
            <div class="playbutton">
              <img class="playcard" src="Icons/playcard.svg" alt="" />
            </div>
          </div>`;
  });

  //Adding eventlistner to each song card
  Array.from(
    document.querySelector(".cardcontainer").getElementsByClassName("card")
  ).forEach((e) => {
    e.querySelector(".playbutton").addEventListener("click", () => {
      const i = parseInt(e.dataset.index);
      currentsongindex = i;
      playing(songs[i]);
    });
  });

  //play and pause functionality
  play.addEventListener("click", () => {
    if (current.src) {
      if (current.paused) {
        current.play();
        playimg.src = "Icons/pause.svg";
      } else {
        current.pause();
        playimg.src = "Icons/Playmusic.svg";
      }
    }
  });
  //<play and pause functionality

  const next = document.querySelector("#playnext");
  const previous = document.querySelector("#playprevious");
  //play next
  next.addEventListener("click", () => {
    if (currentsongindex < songs.length - 1) {
      currentsongindex++;
      playing(songs[currentsongindex]);
    } else {
      currentsongindex = 0;
      playing(songs[currentsongindex]);
    }
  });
  //<play next

  //play previous
  previous.addEventListener("click", () => {
    if (currentsongindex > 0) {
      currentsongindex--;
      playing(songs[currentsongindex]);
    } else {
      currentsongindex = songs.length - 1;
      playing(songs[currentsongindex]);
    }
  });
  //<play previous

  document
    .querySelector(".volumecontrols>img")
    .addEventListener("click", (e) => {
      if (e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg", "mute.svg");
        current.volume = 0;
        volume.value=current.volume*100;
        updateslider(volume, current.volume*100);
      } else {
        e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        current.volume = currentvolume;
        volume.value=current.volume*100;
        updateslider(volume, current.volume*100);
      }
    });
})();
