# TKOM-animation-interpreter
### Przykłady
```
canvas(400, 300); # tworzy obszar roboczy (szerokość x wysokość)px
r = 40; # zmienna int
red = rgb(255, 0, 0); # zmienna przechowująca kolor (red, green, blue, może jeszcze przezroczystość)
wheel1 = circle((300, 260), r, red); # zmienna przechowująca kształt (posX, posY, r, color) 
wheel2 = circle((10, 30), r, red);
pkt = (40, 260);
body = polygon(
	pkt,
	(360, 260),
	360, 200,
	280, 200,
	240, 160,
	160, 160,
	120, 200,
	40, 200,
	rgb(0, 255, 0)
);
blue = rgb(0, 0, 255);
window1 = triangle((130, 200), (160, 170), (160, 200), blue); # współrzędne wierzchołków
window2 = rectangle((170, 170), 50, 30); # prostokąt (posX, posY, szerokość, wysokość)
car = [wheel1, wheel2, body, window1, window2]; # kolejność dodawania definiuje kolejność rysowania
drivingCar = anm(50, 10) {
	100 * move(-1, 0) * car; # 100 razy przesuń samochód w lewo
	100 * move(1, 0) * car; # 100 razy przesuń samochód w prawo
}; # animacja jeżdżenia samochodu w lewo i w prawo (pierwszy co ile milisekund kolejna operacja, drugi ile powtórzeń: 0 - nieskonczonosc)
show drivingCar; # wyświetla animacje 
car.wheel1.color = rgb(255, 0, 0); # zmień kolor koła samochodu
show car; # wyświetl samochód


sha triangle1 = triangle((100, 100), (200, 200), (150, 150), rgb(255, 0, 0));
sha triangle2 = rotate(90) * scale(2.0, 0.5) * triangle1; # obrócenie trójkąta o 90 stopni i przeskalowanie go x2 w osi X i x0.5 w osi Y
show triangle2;

```