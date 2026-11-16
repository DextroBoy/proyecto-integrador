export interface Country {
  id: number;
  nombre: string;
}

export interface Department {
  id: number;
  id_pais: number;
  nombre: string;
}

export interface City {
  id: number;
  id_departamento: number;
  nombre: string;
}

export interface LocationSelection {
  id_pais: number | null;
  id_departamento: number | null;
  id_ciudad: number | null;
}
