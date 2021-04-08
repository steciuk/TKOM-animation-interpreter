# Interpreter języka do budowania dwuwymiarowych scen graficznych
*Autor: Adam Steciuk (300263)*
Projekt polega na stworzeniu interpretera języka do budowania dwuwymiarowych scen graficznych oraz ich animowania. Wykonany zostanie w języku JavaScript z użyciem biblioteki [p5.js](https://p5js.org/). W ramach projektu utworzony zostanie prosty serwis internetowy pozwalający na wgranie pliku z kodem do zinterpretowania oraz wyświetlenie rezultatu jego wykonania.

### Opis funkcjonalny
Język pozwoli na:
 - Tworzenie sceny graficznej o zadanych rozmiarach:
	 - `canvas(sizeX, sizeY)`
 - Definiowanie punktów w przestrzeni i przypisywanie ich do zmiennych:
	 - `(posX, posY)`
 - Definiowanie koloru RGB i przypisanie go do zmiennej:
	 - `rgb(rVal, gVal, bVal)`
 - Tworzenie podstawowych figur geometrycznych oraz definiowanie ich koloru i przypisywanie ich do zmiennych:
	 - `circle(centerPoint, radius, color)`
	 - `rectangle(leftUpperPoint, width, height, color)`
	 - `polygon(point, point, point..., color)`
 - Kopiowanie zdefiniowanych obiektów do innych zmiennych
 - Modyfikowanie koloru figur oraz właściwości definiujących ich kształt także po ich utworzeniu
 - Tworzenie podstawowych transformacji i przypisywanie ich do zmiennych:
	 - `move(dirX, dirY)`
	 - `scale(scaleX, scaleY)`
	 - `shear(shearX, shearY)`
	 - `rotate(angle)`
 - Wykonywanie przekształceń na obiektach poprzez znak mnożenia `*`:
	 - `operation1 * object`
 - Składanie operacji poprzez znak mnożenia `*`:
	 - `operation1 * operation2 * operation3`
 - Wykonywanie n razy tego samego przekształcenia oraz nawiasowanie przekształceń:
	 - `n * operation1`
	 - `n * (operation1 * operaton2)`
 - Grupowanie obiektów. Zgrupowane obiekty będą traktowanie tak samo jak obiekty proste (możliwe będzie dokonywania transformacji na całych grupach na raz oraz grupować je w większe grupy)
 - `[object1, object2, object3...]`
 - Tworzenie prostych animacji poprzez definiowanie przekształceń na obiektach, ilości powtórzeń i odstępu między powtórzeniami. Animacje wykonywać się będą w pętli bądź nie.
 - Definiowanie zmiennych przechowujących liczby całkowite oraz niecałkowite
 - Przeprowadzanie operacji arytmetycznych na zmiennych liczbowych
 - Dodawanie komentarzy zaczynających się oraz kończących się znakiem `#`. 

### Dodatkowe założenia:
 - Język będzie ignorować białe znaki. 
 - Każde polecenie kończyć się będzie średnikiem `;`

### Wymagania funkcjonalne:
 - Odczytywanie, parsowanie i analiza skryptów zapisanych w plikach tekstowych
 - Kontrola poprawności wprowadzonych danych oraz poprawne zgłaszanie błędów wykrytych podczas kolejnych etapów analizy plików
 - Poprawne wykonywanie zdefiniowanych operacji i wyświetlanie ich wyniku przeglądarce internetowej

### Wymagania niefunkcjonale

### Przykłady:
##### 1. Wyświetlenie animacji samochodu poruszającego się w lewo i w prawo:
```
canvas(400, 300); # tworzy obszar roboczy 400px x 300px #
r = 40; # zmienna int #
red = rgb(255, 0, 0); # zmienna przechowująca czerwony kolor #
wheel1 = circle((300, 260), r, red); # zmienna przechowująca kształt #
wheel2 = circle((10, 30), r, red);
pkt = (40, 260);
body = polygon(
	pkt,
	(360, 260),
	(360, 200),
	(280, 200),
	(240, 160),
	(160, 160),
	(120, 200),
	(40, 200),
	rgb(0, 255, 0)
);
blue = rgb(0, 0, 255);
window1 = polygon((130, 200), (160, 170), (160, 200), blue);
window2 = rectangle((170, 170), 50, 30);
car = [wheel1, wheel2, body, window1, window2]; # kolejność dodawania definiuje kolejność rysowania #
drivingCar = anm(50, 10) {
	100 * move(-1, 0) * car; # 100 razy przesuń samochód w lewo o jeden piksel #
	100 * move(1, 0) * car; # 100 razy przesuń samochód w prawo o jeden piksel #
}; # animacja jeżdżenia samochodu w lewo i w prawo (pierwszy argument anm mówi co ile milisekund wykonywana ma być kolejna operacja, drugi ile powtórzeń pętli ma zostać wyświetlonych: 0 - nieskonczonosc) #
car.wheel1.color = rgb(0, 255, 0); # zmiana koloru koła samochodu #
show car; # wyświetla samochód #
show drivingCar; # uruchamia animacje #
```


