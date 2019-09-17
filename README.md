## :bowtie: Node Sass/pug compiler :bowtie:
![SASS](https://img.shields.io/badge/SASS-red.svg)
![PUG](https://img.shields.io/badge/PUG-red.svg)
![Gulp-4.0.0](https://img.shields.io/badge/gulp-4.0.0-red.svg)
![Nodejs](https://img.shields.io/badge/nodejs-green.svg)
![Error handler](https://img.shields.io/badge/Error_handler-yellow.svg)
![browser-sync](https://img.shields.io/badge/browser-sync-darkred.svg)

Sådan installere du og bruger **Sass compiler**.
Hvis du ikke ønsker at bruge **Jade/pug** kan du blot slette **jade/pug** filerne og bruge **html** filen.

**1 )** installer Nodejs fra https://nodejs.org/en/

**2 )** clone eller download mit Repository

**3 )** åben mappen i **VS Code** i terminal skriv først ```npm install gulp -g``` der efter ```npm install gulp``` i root af mappen

**4 )** Du kan nu køre Sass/jade/pug Compileren ved at skrive ```gulp``` i terminalen for at stoppe compileren ```ctrl + c```

Din **App** er din udvikler mappe hvor du har din hjemmeside
- app
  - images
  - includes
  - js
  - sass

I compilieren er der en **Error handler** der fortæller dig hvis du laver fejl i din **Sass** eller **Jade/pug** 
fejlen vil du kunne se i din Terminal

Hvis der er noget der ikke fungere eller noget i tænker der kunne være dejligt at have i systemet så skriv endelig. 

Når compileren køre som den skal vil du kunne se dette i din terminal

```c
Your_computer:standart-gulp Username$ gulp
[15:12:13] Using gulpfile ~/Webaplications/standart-gulp/gulpfile.js
[15:12:13] Starting 'default'...
[15:12:13] Starting 'sass'...
[15:12:13] Finished 'sass' after 53 ms
[15:12:13] Starting 'pug'...
[15:12:13] Finished 'pug' after 58 ms
[15:12:13] Starting 'watch'...
[15:12:13] Starting 'browserSync'...
[Browsersync] Access URLs:
 --------------------------------------
       Local: http://localhost:3000
    External: http://10.161.66.225:3000
 --------------------------------------
          UI: http://localhost:3001
 UI External: http://localhost:3001
 --------------------------------------
[Browsersync] Serving files from: app
```

### **Sass exempel**
```scss
// Variables
  $font-stack:    Helvetica, sans-serif;
  $primary-color: #333;

  body {
    font: 100% $font-stack;
    color: $primary-color;
  }

// Nesting
  .navbar {
    ul {
      li {
        color:green;
      }
    }
  }
```


