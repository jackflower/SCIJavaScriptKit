//klasa reprezentuje opakowanie wektora 2D
var Vector = function(x, y) {
    this.x = x;
    this.y = y;
};

Vector.prototype.setPosition = function(x, y) {
  this.x = x;
  this.y = y;
};

//klasa reprezentuje obiekt, który posiada wymiar oraz reprezentację graficzną
var Physical = function( src,
                            width,
                            height,
                            offsetX,
                            offsetY,
                            frames,
                            duration) {
    this.spritesheet = null;
    this.offset = new Vector(offsetX, offsetY);
    this.size = new Vector(width, height);
    this.position = new Vector(0, 0);
    
    var constants = {
        sizeFactor: 0.125
    };

    this.shadowOffset = new Vector(
                                    this.size.x * constants.sizeFactor,
                                    this.size.y * constants.sizeFactor);
    
    this.frames = 1;
    this.currentFrame = 0;
    this.duration = 1;
   
    this.shown = true;//flaga, czy obiekt ma być renderowany
    this.zoomLevel = 1;
    this.shadow = null;//canvas dla cienia
    this.shadowEnabled = true;//flaga, czy ma być renderowany cień
    
    this.setSpritesheet(src);
    this.setOffset(offsetX, offsetY);
    this.setFrames(frames);
    this.setDuration(duration);

    var d = new Date();
    
    if (this.duration > 0 && this.frames > 0) {
        this.frameTime = d.getTime() + (this.duration / this.frames);
    } else {
        this.frameTime = 0;
    }
};

//metoda ustawia teksturę klatek animacji
Physical.prototype.setSpritesheet = function(src) {
    if (src instanceof Image) {
        this.spritesheet = src;
    } else {
        this.spritesheet = new Image();
	this.spritesheet.src = src;	
    }
};

//metoda zwraca wektor pozycji
Physical.prototype.getPosition = function() {
  return this.position;
};

//metoda zwraca składową X wektora pozycji
Physical.prototype.getPositionX = function() {
  return this.position.x;
};

//metoda zwraca składową Y wektora pozycji
Physical.prototype.getPositionY = function() {
  return this.position.y;
};

//metoda ustawia pozycję obiektu
Physical.prototype.setPosition = function(x, y) {
    this.position.x = x;
    this.position.y = y;
};

//metoda ustawia wektor przesunięcia między klatkami animacji
Physical.prototype.setOffset = function(x, y) {
    this.offset.x = x;
    this.offset.y = y;
};

//metoda zwraca wektor przesunięcia cienia względem obiektu
Physical.prototype.getShadowOffset = function() {
  return this.shadowOffset;
};

//metoda zwraca składową X wektora przesunięcia ciebia względem obiektu
Physical.prototype.getShadowOffsetX = function() {
  return this.shadowOffset.x;
};

//metoda zwraca składową X wektora przesunięcia ciebia względem obiektu
Physical.prototype.getShadowOffsetY = function() {
  return this.shadowOffset.y;
};

//metoda ustawia wektorprzesunięcia cienia względem obiektu
Physical.prototype.setShadowOffset = function(x, y) {
  this.shadowOffset.x = x;
  this.shadowOffset.y = y;
};

//metoda zwraca ilość klatek animacji
Physical.prototype.getFrames = function() {
    return this.frames;
};

//metoda ustawia ilość klatek animacji
Physical.prototype.setFrames = function(fcount) {
    this.currentFrame = 0;
    this.frames = fcount;
};

//metoda zwraca czas trwania sekwencji animacji
Physical.prototype.getDuration = function() {
    return this.duration;
};

//metoda ustawia czas trwania sekwencji animacji
Physical.prototype.setDuration = function(duration) {
    this.duration = duration;
};

//metoda oblicza, po jakim czasie następuje zmiana klatki animacji na kolejną
Physical.prototype.animate = function(t) {
    if (t.getMilliseconds() > this.frameTime)
        this.nextFrame ();
};

//metoda ustawia następną klatkę animacji
Physical.prototype.nextFrame = function() {
    if (this.duration > 0) {
        var d = new Date();
        if (this.duration > 0 && this.frames > 0)
            this.frameTime = d.getTime() + (this.duration / this.frames);
    else
        this.frameTime = 0;	
        this.offset.x = this.size.x * this.currentFrame;
        
        if (this.currentFrame === (this.frames - 1))
            this.currentFrame = 0;
        else
            this.currentFrame++;
    }
};

//metoda zwraca stan renderowania cienia
Physical.prototype.getShadowEnabled = function() {
    return this.shadowEnabled;
};

//metoda ustawiam stan renderowania cienia
Physical.prototype.setShadowEnabled = function(shadowEnabled) {
    this.shadowEnabled = shadowEnabled;
};

//metoda renderuje cień obiektu
Physical.prototype.drawShadow = function(c) {
    var shadowCanvas = document.createElement("canvas");
    var shadowContext = shadowCanvas.getContext("2d");
    
    shadowCanvas.width = this.size.x;
    shadowCanvas.height = this.size.y;

    //na tymczasowym canvas, odrysowujemy obiekt
    shadowContext.drawImage(this.spritesheet,
                            this.offset.x, 
                            this.offset.y, 
                            this.size.x,
                            this.size.y, 
                            0, 
                            0, 
                            this.size.x * this.zoomLevel, 
                            this.size.y * this.zoomLevel);

    //pobieramy dane (tablicę pikseli)
    var idata = shadowContext.getImageData(0,
                                           0,
                                           shadowCanvas.width,
                                           shadowCanvas.height);
    //kolorujemy piksele na czarno - cień                                
    for (var i = 0, len = idata.data.length; i < len; i += 4) {
                    idata.data[i + 0] = 0;  // Red
                    idata.data[i + 1] = 0;  // Green
                    idata.data[i + 2] = 0;  // Blue
                }
    //czyścimy tymczasowy canvas
    shadowContext.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
    //wstawiamy pokolorowane piksele
    shadowContext.putImageData(idata, 0, 0);
    //na docelowy canvas, wstawiamy pokolorowany (cień)
    this.shadow = shadowContext;
    //zapamiętujemy
    c.save();
    c.globalAlpha = 0.25;//ustawiamy kanał Alpha

    var sw = this.size.x * this.zoomLevel;  //przeliczamy wielkość
    var sh = this.size.y * this.zoomLevel;  //przeliczamy wielkość

    //rysujemy tak przygotowaną grafikę na globalnym canvas zadeklarowany w przeglądarce
    c.drawImage(this.shadow.canvas,
                this.position.x + (this.shadowOffset.x),
                this.position.y + (this.shadowOffset.y),
                sw,
                sh);
    c.restore();//przywracamy pierwotny stan canvas
};

//metoda rysuje obiekt zasadniczy
Physical.prototype.drawMain = function(c) {
        c.drawImage(this.spritesheet,
                    this.offset.x,
                    this.offset.y,
                    this.size.x,
                    this.size.y,
                    this.position.x,
                    this.position.y,
                    this.size.x * this.zoomLevel,
                    this.size.y * this.zoomLevel);
};

//metoda renderuje obiekt na scenie
Physical.prototype.draw = function(c) {
    if (this.shown) {
        if(this.shadowEnabled) {
            this.drawShadow(c);
        };
        this.drawMain(c);
    };
};
