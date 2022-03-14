var db_sistema = openDatabase('dbsistema', '1.0', 'Sistema de Facturacion', 5 * 1024 * 1024);
if(!db_sistema){
    alert('Lo siento tu navegado NO soporta BD locales.');
}
var app = new Vue({
    el: '#appMatricula',
    data: {
        alumnos: [],
        buscar: '',
        alumno: {
            accion: 'nuevo',
            msg : '',
            IdAlumno: '',
            codigo: '',
            nombre: '',
            carrera: '',
            materias: '',
            direccion: '',
            telefono: '',
            dui: ''
        },
    },
    methods: {
        buscarAlumno(){
            if( this.buscar.trim().length>0 ){
                this.alumnos = this.alumnos.filter(item=>item.nombre.toLowerCase().indexOf(this.buscar.toLowerCase())>=0);
            } else {
                this.obtenerAlumnos();
            }
            this.obtenerAlumnos(this.buscar);
        },
        guardarAlumno(){
            let sql = '',
                parametros = [];
            if(this.alumno.accion == 'nuevo'){
                sql = 'INSERT INTO alumnos (codigo, nombre, carrera, materias, direccion, telefono, dui) VALUES (?,?,?,?,?,?,?)';
                parametros = [this.alumno.codigo,this.alumno.nombre,this.alumno.carrera,this.alumno.materias,this.alumno.direccion,this.alumno.telefono,this.alumno.dui];
            }else if(this.alumno.accion == 'modificar'){
                sql = 'UPDATE alumnos SET codigo=?, nombre=?, carrera=?, materias=?, direccion=?, telefono=?, dui=? WHERE idAlumno=?';
                parametros = [this.alumno.codigo,this.alumno.nombre,this.alumno.carrera,this.alumno.materias,this.alumno.direccion,this.alumno.telefono,this.alumno.dui];
            }else if(this.alumno.accion == 'eliminar'){
                sql = 'DELETE FROM alumnos WHERE idAlumno=?';
                parametros = [this.alumno.idAlumno];
            }
            db_sistema.transaction(tx=>{
                tx.executeSql(sql,
                    parametros,
                (tx, results)=>{
                    this.alumno.msg = 'Alumno procesado con exito';
                    this.nuevoAlumno();
                    this.obtenerAlumnos();
                },
                (tx, error)=>{
                    this.alumno.msg = `Error al guardar el Alumno ${error.message}`;
                });
            });
        },
        modificarAlumno(alumno){
            this.alumno = alumno;
            this.alumno.accion = 'modificar';
        },
        eliminarAlumno(alumno){
            if( confirm(`¿Esta seguro de eliminar el Alumno ${alumno.nombre}?`) ){
                this.alumno.idAlumno= alumno.idAlumno;
                this.alumno.accion = 'eliminar';
                this.guardarAlumno();
            }
        },
        obtenerAlumnos(busqueda=''){
            db_sistema.transaction(tx=>{
                tx.executeSql(`SELECT * FROM alumnos WHERE nombre like "%${busqueda}%" OR codigo like "%${busqueda}%"`, [], (tx, results)=>{
                    this.alumnos = results.rows;
                    this.alumnos = [];
                    for(let i=0; i<results.rows.length; i++){
                        this.alumnos.push(results.rows.item(i));
                    }
                });
            });
        },
        nuevoAlumno(){
            this.alumno.accion = 'nuevo';
            this.alumno.idAlumno = '';
            this.alumno.codigo = '';
            this.alumno.nombre = '';
            this.alumno.carrera = '';
            this.alumno.materias = '';
            this.alumno.direccion = '';
            this.alumno.telefono = '';
            this.alumno.dui = '';
        }
    },
    created(){
        db_sistema.transaction(tx=>{
            tx.executeSql('CREATE TABLE IF NOT EXISTS alumnos(idAlumno INTEGER PRIMARY KEY AUTOINCREMENT, '+
                'codigo char(10), nombre char(75), carrera TEXT, materias char(5), direccion TEXT, telefono char(10), dui char(10))');
        }, err=>{
            console.log('Error al crear la tabla Alumnos', err);
        });
        this.obtenerAlumnos();
    }
});
