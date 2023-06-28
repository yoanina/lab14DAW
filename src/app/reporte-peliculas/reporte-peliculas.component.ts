import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { style } from '@angular/animations';
import * as XLSX from 'xlsx';
import { createObjectCsvWriter } from 'csv-writer';



@Component({
  selector: 'app-reporte-peliculas',
  templateUrl: './reporte-peliculas.component.html',
  styleUrls: ['./reporte-peliculas.component.css']
})
export class ReportePeliculasComponent implements OnInit {
  peliculas: any[] = [];
  peliculasFiltradas: any[] = [];

  //filtro
  generoFiltro: string = '';
  anioLanzamientoFiltro: number | null = null;

  constructor(private http: HttpClient) {
    (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
 
  }

  ngOnInit(): void {
    this.http.get<any[]>('./assets/peliculas.json').subscribe(data => {
      this.peliculas = data;
    });
  }

  aplicarFiltro() {
    // Filtrar las películas según los criterios seleccionados
    this.peliculasFiltradas = this.peliculas.filter(pelicula => {
      const cumpleGenero = this.generoFiltro === '' || pelicula.genero.includes(this.generoFiltro);
      const cumpleAnioLanzamiento = this.anioLanzamientoFiltro === null || pelicula.lanzamiento === this.anioLanzamientoFiltro;
      return cumpleGenero && cumpleAnioLanzamiento;
    });
  }
  
  generarPDF() {
    const peliculasFiltradas = this.peliculas.filter(pelicula => {
      // Filtrar por género
      const cumpleGenero = this.generoFiltro === '' || pelicula.genero.includes(this.generoFiltro);
  
      // Filtrar por año de lanzamiento
      const cumpleAnioLanzamiento = this.anioLanzamientoFiltro === null || pelicula.lanzamiento === this.anioLanzamientoFiltro;
  
      return cumpleGenero && cumpleAnioLanzamiento;
    });
    const contenido = [
      { text: 'Informe de Películas', style: 'header' },
      { text: '\n\n' , style: 'headers'},
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            [{ text: 'Título', style: 'columnHeader' },
            { text: 'Género', style: 'columnHeader' },
            { text: 'Año de lanzamiento', style: 'columnHeader' }
          ],
            ...peliculasFiltradas.map(pelicula => [pelicula.titulo, pelicula.genero, pelicula.lanzamiento.toString()])
          ]
        },
        style:'tableRow'//estiolos a las filas de la tabla
      }
    ];

    const estilos = {
      header: {
        fontSize: 19,
        bold: true,
        marginTop:20,
        color: '#7f4f4f',
        marginLeft:175,
        
      },
      //#5f3b3b
      tableRow: {
        fontSize: 14,
        color: 'black',
        fillColor:'#fff2e9', // Color de fondo de las filas
        bold: false, // Sin negrita en las filas
        paddingTop: 30,
      },

      headers:{
        color: 'red',
        bold: true,
      },
      columnHeader: {
        bold: true,
        fontSize: 15,
        fillColor: '#7f6f6f',
        color:'white',
        margin: 10,
        display:'flex',
        
         // Márgenes superior, derecho, inferior, izquierdo
      },
    };

    const documentDefinition = {
      content: contenido,
      styles: estilos
    };

    pdfMake.createPdf(documentDefinition).open();
  }

  exportToExcel() {
    const peliculasFiltradas = this.peliculasFiltradas.map(pelicula => ({
      Título: pelicula.titulo,
      Género: pelicula.genero,
      'Año de lanzamiento': pelicula.lanzamiento.toString()
    }));
  
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(peliculasFiltradas);
    XLSX.utils.book_append_sheet(wb, ws, 'Películas');
  
    XLSX.writeFile(wb, 'informe_peliculas.xlsx');
  }
  
  exportToCSV() {
    const csvContent = "data:text/csv;charset=utf-8," + this.convertToCSV(this.peliculasFiltradas);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "informe_peliculas.csv");
    document.body.appendChild(link);
    link.click();
  }
  
  convertToCSV(data: any[]) {
    const header = Object.keys(data[0]);
    const rows = data.map(obj => header.map(key => obj[key]));
    const csvArray = [header, ...rows];
    return csvArray.map(row => row.join(",")).join("\n");
  }
  
  
}





