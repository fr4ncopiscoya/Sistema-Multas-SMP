import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  ElementRef,
  HostListener
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { MasterService } from 'src/app/services/master.service';
import { SanidadService } from 'src/app/services/sanidad.service';
import { SigtaService } from 'src/app/services/sigta.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MenuComponent } from 'src/app/components/menu/menu.component';
import Swal from 'sweetalert2';
import { Platform } from '@angular/cdk/platform';
import * as XLSX from 'xlsx';
import { createMask } from '@ngneat/input-mask';
import { formatNumber } from '@angular/common';



@Component({
  selector: 'app-multas',
  templateUrl: './multas.component.html',
  styleUrls: ['./multas.component.css'],
})
export class MultasComponent implements OnInit {
  // MODAL
  @ViewChild('template') miModal!: ElementRef;
  modalRefs: { [key: string]: BsModalRef } = {}; // Objeto para almacenar los modalRefs
  modalRef?: BsModalRef;
  //FORMULARIO
  form!: FormGroup;

  @ViewChild(DataTableDirective, { static: false })
  dtElement: any;
  dtElementModal: any;

  dtTrigger: Subject<void> = new Subject<void>();
  dtTriggerModal: Subject<void> = new Subject<void>();
  dtOptionsModal: DataTables.Settings = {};

  currencyInputMask = createMask({
    alias: 'numeric',
    groupSeparator: ',',
    digits: 2,
    digitsOptional: false,
    prefix: 'S/. ',
    placeholder: '0',
  });


  /// ================== VARIABLES ============================

  //DATA PARA ALMACENAR
  data: any;
  dataMulta: any;
  datosMulta: any;
  datosContribuyente: any;
  datosNombreContribuyente: any = [];
  datosDescripcion: any;
  dataUsuario: any;
  datosUser: any;
  datosFechas: any;
  dataPago: any;

  databotones: any;

  // BUSQUEDA POR CODIGO CONTRIBUYENTE
  cnombre: string = '';
  r_descri: string = '';

  //BUSQUEDA POR CODIGO DE INFRACCION
  p_anypro: string = '';
  p_codinf: string = '';

  //BUSQUEDA DE CONTRIBUYENTE (MODAL)
  p_nomcontri: string = '';
  p_mensaje: string = '';

  //REGISTRO DE MULTA
  p_idcorr: number = 0;
  p_codcon: string = '';
  p_numnot: string = '';
  p_desinf: string = '';
  p_fecini: string = '';
  p_fecfin: string = '';

  //FORMULARIO RESOLUCION
  formResolucion!: FormGroup;
  cnumres: string = '';
  dfecres: string = '';
  dfecnot: string = '';
  observc: string = '';
  idcorrl: number = 0;
  submitted: boolean = false;

  //FORMULARIO ANULAR RESOLUCION
  formAnularResolucion!: FormGroup;
  p_obsresol_anular: string = '';
  submitted_anular: boolean = false;

  error: string = ''

  //DATOS FECHAS
  p_tipfec: number = 0;
  mrf_id: number = 0;
  mrf_descri: string = '';

  //DATOS USUARIO
  nomusi: string = '';
  nomusm: string = '';
  fecins: string = '';
  fecmod: string = '';

  //VER DATOS PAGO
  pago_codadm: string;
  pago_codmul: string;
  pago_desmul: string;
  pago_fecnot: string;
  pago_fecpag: string;
  pago_monben: string;
  pago_monpag: string;
  pago_montot: string;
  pago_nomadm: string;
  pago_numnot: string;
  pago_numrec: string;
  pago_tipdoi: string;

  //Botones activar
  apb_activo: number = 0;
  btn_id: number = 0;

  botonesMultas: any;

  //BOTONES
  btnNuevo: number;
  btnVer: number;
  btnEditar: number;
  btnAnular: number;
  btnPdf: number;
  btnExcel: number;

  numid_deuda: number;


  constructor(
    private appComponent: AppComponent,
    private serviceMaster: MasterService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private serviceSanidad: SanidadService,
    private sanidadService: SanidadService,
    private sigtaService: SigtaService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private platform: Platform,
  ) {

    this.appComponent.login = false;
    this.dataUsuario = localStorage.getItem('dataUsuario');
    this.datosUser = JSON.parse(localStorage.getItem('dataUser'))

    // this.botonesMultas = this.appComponent.botonesPermisos;

    // this.botonesMultas = localStorage.getItem('menu-items')
  }
  // Redirige a la ruta especial al presionar F5
  // @HostListener('document:keydown', ['$event'])
  // handleKeyboardEvent(event: KeyboardEvent) {
  //   if (event.key === 'F5') {
  //     this.router.navigate(['/dashboard']);
  //   }
  // }

  ngOnInit(): void {
    this.dtOptionsModal = {
      // paging: true,
      // pagingType: 'numbers',
      info: false,
      scrollY: '400px',
      columnDefs: [
        { width: '650px', targets: 6 },
      ],
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json"
      },
      order: [['0', 'desc']]
    }
    this.validacionBotones();
    this.listarFechas();
    const fechaActual = new Date().toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTriggerModal.unsubscribe();
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
    this.dtTriggerModal.next();
    /* (document.querySelector('.dataTables_scrollBody') as HTMLElement).style.top = '150px'; */
  }

  validacionBotones() {
    const botonesMultas = JSON.parse(localStorage.getItem('menu-items'))
    // const botonesMultas = JSON.parse(this.botonesMultas);

    botonesMultas.forEach((item: any) => {
      switch (item.bot_id) {
        case 1:
          this.btnNuevo = item.apb_activo
          break;
        case 2:
          this.btnEditar = item.apb_activo
          break;
        case 3:
          this.btnVer = item.apb_activo
          break;
        case 4:
          this.btnAnular = item.apb_activo;
          break;
        case 5:
          this.btnExcel = item.apb_activo
          break;
        case 10:
          this.btnPdf = item.apb_activo
          break;
        default:
          break;
      }
    })
  }

  exportarExcel() {
    let array = [];

    for (let i = 0; i < this.datosMulta.length; i++) {
      array.push({
        'Nº Notificación': this.datosMulta[i].nnumnot || "",
        'Código Administrado': this.datosMulta[i].ccontri || "",
        'Descripción Multa': this.datosMulta[i].dmulta || "",
        'Nº Resolución': this.datosMulta[i].cnumres || "",
        'Fecha de Notificiación': this.datosMulta[i].dfecnot || "",
        'Monto': this.datosMulta[i].nmonto || "",
        'Estado': this.datosMulta[i].estreg || ""
      });
    }

    const fileName = "Reporte.xlsx";
    const ws = XLSX.utils.json_to_sheet(array);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja1");

    XLSX.writeFile(wb, fileName);
  }


  //OBTENGO LOS VALORES DE VARIABLES(MODAL)
  confirmClick(value: string) {
    this.p_codcon = value;
    this.obtenerNombrePorCod(value);
    this.modalService.hide(1);
  }

  confirmClickDescri(value: string) {
    this.p_codinf = value;
    this.obtenerDescriPorCod(value);
    this.modalService.hide(2);
  }


  //DIGITAR UNICAMENTE NUMEROS
  validarNumero(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode < 48 || keyCode > 57) {
      event.preventDefault();
    }
  }

  //VALIDAR CAMPO VACIO EN CODIGO ADMINISTRADO
  validarCodigoMultaVacio(event: any) {
    if (this.p_codcon.length < 7) {
      this.cnombre = ''
    } 1
  }

  validarCodigoInfraVacio(event: any) {
    if (this.p_codinf.length < 7) {
      this.r_descri = ''
    }
  }

  validarCodigoNotificacion(event: any) {
    if (this.p_numnot.length < 7) {
      this.p_numnot = ''
    }
  }

  onInputChange(event: any) {
    event.target.value = event.target.value.toUpperCase();
  }

  //FILTROS DE BUSQUEDA POR FECHA 
  busquedaTipoFecha() {
    const fechaActual = new Date().toISOString().split('T')[0];

    const disabled_fecini = document.getElementById('fecini') as HTMLInputElement
    const disabled_fecfin = document.getElementById('fecfin') as HTMLInputElement

    if (this.mrf_id != 0) {
      disabled_fecini.classList.remove('disabled-color');
      disabled_fecfin.classList.remove('disabled-color');
      disabled_fecini.removeAttribute('disabled')
      disabled_fecfin.removeAttribute('disabled')
      this.p_fecini = fechaActual;
      this.p_fecfin = fechaActual;

    } else {
      disabled_fecini.classList.add('disabled-color')
      disabled_fecfin.classList.add('disabled-color')
      disabled_fecini.setAttribute('disabled', 'disabled')
      disabled_fecfin.setAttribute('disabled', 'disabled')
      this.p_fecini = '';
      this.p_fecfin = '';
    }
  }

  getDeuda(id: any) {
    let post = {
      p_deudid: id,
    };
    console.log(post);
    this.spinner.show();

    this.sigtaService.validarDescuento(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        console.log(data);
        // this.numid_deuda = data[0].numid
        this.error = data[0].mensa;
        const errorCode = data[0].error;
        console.log(this.error);

        Swal.fire({
          title: this.error,
          // text: "No podrás deshacer esto!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si"
        }).then((result) => {
          if (result.isConfirmed) {
            this.aplicarDescuento(id, data[0].numid);
          }
        });

        // const icon = this.getIconByErrorCode(errorCode);

        // this.errorSweetAlert(icon, this.goBackToMultas.bind(this));
      },
      error: (error: any) => {
        this.spinner.hide();
        console.log(error);
        Swal.fire({
          title: "Error",
          text: "Ocurrió un problema",
          icon: "error"
        });
      },
    });
  }

  aplicarDescuento(deudid: any, chk: any) {
    let post = {
      p_deudid: deudid,
      p_chkdes: chk,
    };
    console.log(post);
    this.spinner.show();

    this.sigtaService.aplicarDescuento(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        console.log(data);

        this.error = data[0].mensa;
        const errorCode = data[0].error;
        console.log(this.error);

        const icon = this.getIconByErrorCode(errorCode);

        this.errorSweetAlert(icon, this.goBackToMultas.bind(this));
      },
      error: (error: any) => {
        this.spinner.hide();
        console.log(error);
        Swal.fire({
          title: "Error",
          text: "Hubo un problema al intentar aplicar el descuento.",
          icon: "error"
        });
      },
    });
  }

  regularizarCuenta(data: any) {
    console.log(data);
    let post = {
      p_codcon: data.ccontri,
      p_numnot: data.nnumnot,
      p_anynot: data.cano,
    };
    console.log(post);
    this.spinner.show();

    this.sigtaService.regularizarCuentaCorriente(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        console.log(data);

        this.error = data[0].mensa;
        const errorCode = data[0].error;
        console.log(this.error);

        const icon = this.getIconByErrorCode(errorCode);

        this.errorSweetAlert(icon, this.goBackToMultas.bind(this));
      },
      error: (error: any) => {
        this.spinner.hide();
        console.log(error);
        Swal.fire({
          title: "Error",
          text: "Hubo un problema al intentar actualizar la cuenta",
          icon: "error"
        });
      },
    });
  }


  validarFechas(): boolean {
    let result = false;

    if (this.p_fecini != '' && this.p_fecfin != '') {
      // result = true;

      if (this.p_fecini.length < 7 || this.p_fecfin.length < 7) {
        this.errorSweetAlertFechaIncompleta()
        result = true;
      } else {
        if (this.p_fecini > this.p_fecfin) {
          this.errorSweetAlertFecha();
          result = true;

        } else {
          result = false;
        }
      }
    } else {

    }

    return result;
  }



  descargaExcel() {
    let btnExcel = document.querySelector(
      '#tablaAplicacion_wrapper .dt-buttons .dt-button.buttons-excel.buttons-html5'
    ) as HTMLButtonElement;
    btnExcel.click();
  }




  //=========================== MODALES =============================
  cerrarModal(modalKey: string) {
    if (this.modalRefs[modalKey]) {
      this.modalRefs[modalKey].hide(); // Cierra el modal si está definido
    }
    this.formResolucion.reset();
  }

  listarAdm(template: TemplateRef<any>) {
    this.modalRefs['listar-administrado'] = this.modalService.show(template, { id: 1, class: 'modal-lg', backdrop: 'static', keyboard: false });
  }

  modalDescri(templateDescri: TemplateRef<any>) {
    this.modalRefs['listar-descri'] = this.modalService.show(templateDescri, { id: 2, class: 'modal-xl', backdrop: 'static', keyboard: false });
  }

  // modalInformeFinal(modalInformeFinal: TemplateRef<any>) {
  //   this.modalRefs['modalInformeFinal'] = this.modalService.show(modalInformeFinal, { id: 7, class: 'modal-xl', backdrop: 'static', keyboard: false });
  // }

  modalAnularMulta(template: TemplateRef<any>, data: any) {
    this.idcorrl = data.id_corrl;

    this.modalRefs['modalAnularMulta'] = this.modalService.show(template, { id: 6, class: '', backdrop: 'static', keyboard: false });
    this.sigtaService.idcorrl = this.idcorrl;
  }

  modalPago(template: TemplateRef<any>, data: any) {
    this.verDatosPago(data.id_corrl)
    this.modalRefs['modalVerPago'] = this.modalService.show(template, { id: 8, class: '', backdrop: 'static', keyboard: false });
    this.sigtaService.idcorrl = this.idcorrl;
  }





  // ================== MENSAJES SWEETALERT =====================
  private getIconByErrorCode(errorCode: string): 'error' | 'warning' | 'info' | 'success' {
    switch (errorCode) {
      case '-100':
        return 'error';
      case '-101':
        return 'error';
      case '-102':
        return 'error';
      case '-103':
        return 'error';
      case '-104':
        return 'error';
      case '-105':
        return 'error';
      case '0':
        return 'success';
      default:
        return 'error';
    }
  }

  private errorSweetAlert(icon: 'error' | 'warning' | 'info' | 'success' = 'error', callback?: () => void) {
    Swal.fire({
      icon: icon,
      text: this.error || 'Hubo un error al procesar la solicitud',
    }).then((result) => {
      if (result.isConfirmed && callback) {
        callback();
      }
    });
  }


  private errorSweetAlertCode() {
    Swal.fire({
      icon: 'error',
      text: 'Por favor ingrese un código válido',
    });
  }
  private errorSweetAlertData() {
    Swal.fire({
      icon: 'info',
      text: 'No se encontraron datos en su busqueda',
    });
  }
  private errorSweetAlertFecha() {
    Swal.fire({
      icon: 'info',
      text: 'Fecha Inicio no puede ser mayor a Fecha Fin',
    });
  }

  private errorSweetAlertFechaIncompleta() {
    Swal.fire({
      icon: 'info',
      text: 'Fecha Incompleta',
    });
  }


  private errorSweetAlertFiltros() {
    Swal.fire({
      icon: 'info',
      text: 'Por favor ingrese un filtro de busqueda',
    });
    this.datosMulta = []
  }

  public sweetAlertAnularReso(data: any) {
    console.log(data);
    this.idcorrl = data

    Swal.fire({
      title: "Estas seguro de anular esta resolución?",
      text: "No podrás deshacer esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, anular"
    }).then((result) => {
      if (result.isConfirmed) {
        this.anularResolucion();
      }
    });
  }

  anularResolucion() {
    let post = {
      p_idcorr: this.idcorrl,
    };
    console.log(post);
    this.spinner.show();

    this.sigtaService.anularResolucion(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        console.log(data);

        this.error = data[0].mensa;
        const errorCode = data[0].error;
        console.log(this.error);

        const icon = this.getIconByErrorCode(errorCode);

        this.errorSweetAlert(icon, this.goBackToMultas.bind(this));
      },
      error: (error: any) => {
        this.spinner.hide();
        console.log(error);
        Swal.fire({
          title: "Error",
          text: "Hubo un problema al intentar eliminar la resolución.",
          icon: "error"
        });
      },
    });
  }



  // ===================== FUNCIONES =====================

  // Obtener la fecha actual en formato "YYYY-MM-DD"
  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // formatFecha(fechaBD: string): string {
  //   const fecha = new Date(fechaBD);

  //   fecha.setHours(fecha.getHours() - 5); 

  //   // Extract date components
  //   const dia = fecha.getDate().toString().padStart(2, '0');
  //   const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  //   const año = fecha.getFullYear();

  //   return `${dia}/${mes}/${año}`;
  // }

  getDataUser(event: MouseEvent, data: any) {
    const trs = document.querySelectorAll('tbody tr') as NodeListOf<HTMLTableRowElement>;
    trs.forEach((tr: HTMLTableRowElement) => {
      tr.classList.remove('active-color');
    });

    const target = event.target as HTMLElement;
    const tr = target.closest('tr') as HTMLTableRowElement | null;
    if (tr) {
      tr.classList.add('active-color');
    }

    this.nomusi = data.nomusi;
    // this.nomusi = data.usuins
    this.nomusm = data.nomusm;
    // this.nomusm = data.usumod;
    this.fecins = data.fecins;
    this.fecmod = data.fecmod;

  }

  validarBotones(data: any) {
    //Multa / Notificacion
    const verMultaElements = document.querySelectorAll('.verMulta');
    const editarMultaElements = document.querySelectorAll('.editarMulta');
    const anularMultaElements = document.querySelectorAll('.anularMulta');
    const reganuMultaElements = document.querySelectorAll('.registraranularInfo');
    const btnReso = document.getElementById('btnReso')

    //Resolucion
    const verResElements = document.querySelectorAll('.verRes');
    const anularResElements = document.querySelectorAll('.anularRes');
    const registrarResElements = document.querySelectorAll('.registrarRes');

    if (data.estreg === "Registrado" && data.cnumres > 0) {
      //Multa
      verMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
      editarMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });
      anularMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });
      reganuMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });

      //Resolucion
      verResElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
      anularResElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
      registrarResElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });
    } else {
      verMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
      editarMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
      anularMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
      reganuMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });

      verResElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });
      anularResElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });
      registrarResElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
    }

    if (data.estreg != 'Registrado') {
      //Multa
      verMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
      editarMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });
      anularMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });
      reganuMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });

      btnReso?.setAttribute('disabled', 'disabled')

      // verResElements.forEach((element: Element) => {
      //   (element as HTMLElement).style.display = 'none';
      // });
      // anularResElements.forEach((element: Element) => {
      //   (element as HTMLElement).style.display = 'none';
      // });
      // registrarResElements.forEach((element: Element) => {
      //   (element as HTMLElement).style.display = 'none';
      // });
      // reganuMultaElements.forEach((element: Element) => {
      //   (element as HTMLElement).style.display = 'none';
      // });

    } else {
      btnReso?.removeAttribute('disabled')
    }


  }


  validarMultaAnular(data: any) {
    const verMultaElements = document.querySelectorAll('.verMulta');
    const editarMultaElements = document.querySelectorAll('.editarMulta');
    const anularMultaElements = document.querySelectorAll('.anularMulta');

    if (data.estreg != "Registrado") {
      verMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
      editarMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });
      anularMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });
    } else {
      verMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
      editarMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
      anularMultaElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
    }
  }

  validarReso(data: any) {
    const verResElements = document.querySelectorAll('.verRes');
    const anularResElements = document.querySelectorAll('.anularRes');
    const registrarResElements = document.querySelectorAll('.registrarRes');

    if (data.cnumres === "") {
      verResElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });
      anularResElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });
      registrarResElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
    } else {
      verResElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
      anularResElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = '';
      });
      registrarResElements.forEach((element: Element) => {
        (element as HTMLElement).style.display = 'none';
      });
    }
  }

  goBackToMultas() {
    setTimeout(() => {
      switch (this.error) {
        case 'Resolucion Registrada Correctamente':
        case 'Resolucion Anulada Correctamente':
        case 'Cuenta Corriente Actualizada':
          this.modalService.hide(3)
          this.consultarMulta();
          // location.reload();
          break;
        default:
          //
          break;
      }
    });
  }


  limpiarCampos() {
    this.spinner.show()
    setTimeout(() => {
      this.spinner.hide();
    }, 200);

    this.p_codcon = '';
    this.cnombre = '';
    // this.p_fecini = '';
    // this.p_fecfin = '';
    this.p_codinf = '';
    this.r_descri = '';
    this.p_numnot = '';
  }

  editarDatosMulta(id: string | null) {


    if (id !== null) {
      this.router.navigate(['/multas/editar-multa'], { queryParams: { id: id } });
      // this.router.navigate(['/multas/editar-multa/', id]);
    } else {

    }
  }

  verDatosMulta(id: string | null) {
    if (id !== null) {
      this.router.navigate(['/multas/ver-multa/', id]);
    }
  }

  validarDatosVaciosBusqueda() {
    if (this.mrf_id === 0 && this.p_codcon === '' && this.p_codinf === '' && this.p_numnot === '') {
      this.dataMulta = []
    }
  }





  //====================== CONSULTAR/FILTRAR MULTA =====================
  consultarMulta() {

    let post = {
      p_codcon: this.p_codcon,
      p_numnot: this.p_numnot,
      p_codinf: this.p_codinf,
      p_tipfec: Number(this.mrf_id),
      p_fecini: this.p_fecini.toString(),
      p_fecfin: this.p_fecfin.toString(),
      p_idcorr: this.p_idcorr,
      tdi_id: this.datosUser[0].tdi_id,
    };

    if (this.mrf_id > 0 || this.p_codcon != '' || this.p_codinf != '' || this.p_numnot != '') {
      this.spinner.show();

      this.sigtaService.consultarMulta(post).subscribe({
        next: (data: any) => {
          this.spinner.hide();

          this.datosMulta = data;

          if (!data || data.length === 0) {
            this.datosMulta = [];
          }

          this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next();
          });
        },
        error: (error: any) => {
          this.errorSweetAlertData();
          this.spinner.hide();
          // this.datosMulta = ''
        },
      });

      // this.dtOptionsModal = {
      //   order: [['0', 'asc']]
      // };
    } else {
      this.spinner.hide();
      this.errorSweetAlertFiltros();
      this.datosMulta = []

      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    }

  }

  consultarMultaExport() {

    let result;
    result = this.validarFechas();

    if (!result) {

      let post = {
        p_codcon: this.p_codcon,
        p_numnot: this.p_numnot,
        p_codinf: this.p_codinf,
        p_fecini: this.p_fecini.toString(),
        p_fecfin: this.p_fecfin.toString(),
        p_idcorr: this.p_idcorr,
      };
      this.spinner.show();

      this.sigtaService.consultarMultaExport(post).subscribe({
        next: (data: any) => {

          this.datosMulta = data;

        },
        error: (error: any) => {
        },
      });
    }
  }

  listarFechas() {
    let post = {

    };

    this.sigtaService.listarFechas(post).subscribe({
      next: (data: any) => {

        this.datosFechas = data;
        this.mrf_descri = data[0].mrf_descri;
        this.mrf_id = data[0].mrf_id;
        this.busquedaTipoFecha();
        this.consultarMulta();
      },
      error: (error: any) => {
      },
    });
  }

  // ==================== ENCUENTRA NOMBRE DIGITANDO CODIGO ==================
  verDatosPago(id: any) {
    console.log(id);

    let post = {
      p_idcorrl: id,
    };

    this.sigtaService.verDatosPago(post).subscribe({
      next: (data: any) => {
        console.log("datos-pago: ", data);

        this.dataPago = data;

        // let montotconvert = parseFloat(data[0].montot.replace(/[^\d.,]/g, '').replace(',', '.'));
        // let montotformat = montotconvert.toLocaleString('es-ES', { minimumFractionDigits: 2 });
        // this.pago_montot = montotformat;

        // let monpagconvert = parseFloat(data[0].monpag.replace(/[^\d.,]/g, '').replace(',', '.'));
        // let monpagformat = monpagconvert.toLocaleString('es-ES', { minimumFractionDigits: 2 });
        // this.pago_monpag = monpagformat;

        // let monbenconvert = parseFloat(data[0].monben.replace(/[^\d.]/g, ''));
        // let monbenformat = monbenconvert.toLocaleString('es-ES', { minimumFractionDigits: 2 });
        // this.pago_monben = monbenformat;

        this.pago_codadm = data[0].codadm
        this.pago_codmul = data[0].codmul
        this.pago_desmul = data[0].desmul
        this.pago_fecnot = data[0].fecnot
        this.pago_fecpag = data[0].fecpag
        this.pago_monben = formatNumber(Number(data[0].monben), 'en-US', '1.2')
        this.pago_monpag = formatNumber(Number(data[0].monpag), 'en-US', '1.2')
        this.pago_montot = formatNumber(Number(data[0].montot), 'en-US', '1.2')
        this.pago_nomadm = data[0].nomadm
        this.pago_numnot = data[0].numnot
        this.pago_numrec = data[0].numrec
        this.pago_tipdoi = data[0].tipdoi

        const date = new Date(this.pago_fecnot);
        this.pago_fecnot = date.toISOString().split('T')[0];

      },
      error: (error: any) => {
      },
    });

  }


  obtenerNombrePorCod(value: any) {
    let post = {
      p_codcon: this.p_codcon,
    };

    if (this.p_codcon != '') {
      this.sigtaService.obtenerNombrePorCod(post).subscribe({
        next: (data: any) => {
          this.spinner.hide();

          if (data && data.length > 0) {
            this.cnombre = data[0].cnombre;
          } else {
            this.errorSweetAlertCode();
            this.cnombre = '';
            this.p_codcon = '';
          }
        },
        error: (error: any) => {
          this.errorSweetAlertCode();
          this.cnombre = '';
          this.p_codcon = '';
        },
      });
    }

  }




  //========================= MODAL - BUSCAR DESCRIPCION ====================
  obtenerDescriPorCod(value: any) {
    const añoActual = new Date().getFullYear();

    let post = {
      p_anypro: añoActual.toString(),
      p_codinf: this.p_codinf,
    };

    if (this.p_codinf != '') {


      this.spinner.show();

      this.sigtaService.obtenerDescripcionPorCod(post).subscribe({
        next: (data: any) => {
          this.spinner.hide();

          if (this.p_codinf == '') {
            this.errorSweetAlertCode()
            this.r_descri = '';
          } else {
            if (data && data.length > 0) {
              this.r_descri = data[0].r_descri;
            } else {
              this.errorSweetAlertCode();
              this.r_descri = '';
              this.p_codinf = '';
            }
          }


        },
        error: (error: any) => {
          this.spinner.hide();
          this.errorSweetAlertCode();
          this.r_descri = '';
          this.p_codinf = '';
        },
      });
    }

  }





  // ======================= MODAL - BUSCAR CONTRIBUYENTE ========================
  busContribuyente() {
    let post = {
      p_nomcontri: this.p_nomcontri,
      p_mensaje: this.p_mensaje,
    };

    this.spinner.show();

    this.sigtaService.busContribuyente(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();

        this.datosContribuyente = data;
        this.dtElementModal.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTriggerModal.next();
        });
      },
      error: (error: any) => {
        this.spinner.hide();
      },
    });
  }






  //====================== RESOLUCIÓN =====================

  setFormResolucion() {
    this.formResolucion = this.fb.group({
      cnumres: ['', [Validators.required]],
      dfecres: ['', [Validators.required]],
      // dfecnot: ['', [Validators.required]],
      // observc: ['', [Validators.required]],
    })
  }

  rellenarCerosResolucion() {
    this.cnumres = this.cnumres.padStart(6, '0');
  }

  modalRegistrarResolucion(template: TemplateRef<any>, data: any) {
    this.idcorrl = data.id_corrl;
    this.submitted = false;
    this.setFormResolucion();
    this.modalRefs['modalRegistrarRes'] = this.modalService.show(template, { id: 3, class: '', backdrop: 'static', keyboard: false });
  }

  modalVerResolucion(template: TemplateRef<any>, data: any) {
    this.idcorrl = data.id_corrl;

    this.modalRefs['modalVerResolucion'] = this.modalService.show(template, { id: 4, class: '', backdrop: 'static', keyboard: false });
    this.sigtaService.idcorrl = this.idcorrl;
  }

  modalInforme(template: TemplateRef<any>, data: any) {
    this.idcorrl = data.id_corrl;

    this.modalRefs['modalInformeFinal'] = this.modalService.show(template, { id: 7, class: '', backdrop: 'static', keyboard: false });
    this.sigtaService.idcorrl = this.idcorrl;
  }

  guardarResolucion() {
    let storedData = localStorage.getItem("dataUsuario");
    if (storedData !== null) {
      this.dataUsuario = JSON.parse(storedData);
    }

    this.submitted = true;
    // if (this.formResolucion.valid) {

    let post = {
      idcorrl: this.idcorrl,
      cnumres: this.cnumres,
      cusuari: this.dataUsuario.codusu,
      dfecres: this.dfecres,
      dfecnot: this.dfecnot,
      observc: this.observc
    }


    this.sigtaService.registrarResolucion(post).subscribe({
      next: (data: any) => {
        this.error = data[0].mensa;
        const errorCode = data[0].error;

        // Selecciona el icono según el código de error
        const icon = this.getIconByErrorCode(errorCode);

        // Muestra el SweetAlert con el icono y el mensaje de error
        this.errorSweetAlert(icon, this.goBackToMultas.bind(this));
        // this.goBackToMultas()
      },
      error: (error: any) => {
        this.spinner.hide();
      },
    });
    // this.formResolucion.reset();
    // }
  }






  // ===================== ANULAR RESOLUCION ====================
  setFormAnularResolucion() {
    this.formAnularResolucion = this.fb.group({
      // p_obsresol_anular: ['', [Validators.required]],
    })
  }

  modalAnularResolucion(template: TemplateRef<any>, data: any) {
    this.idcorrl = data.id_corrl;
    // this.dataMulta = data;

    this.submitted = false;
    this.setFormAnularResolucion();
    this.modalRefs['modalAnularRes'] = this.modalService.show(template, { id: 5, class: '', backdrop: 'static', keyboard: false });
    this.sigtaService.idcorrl = this.idcorrl;
  }

  submitAnularResolucion() {
    this.submitted = true;
    if (this.formAnularResolucion.valid) {

    }
  }
}
