import { Component, EventEmitter, OnInit, Output, ViewChild, OnDestroy, AfterViewInit, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import { SigtaService } from 'src/app/services/sigta.service';
import { DataTableDirective } from 'angular-datatables';
import { NgxSpinnerService } from 'ngx-spinner';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-administrado',
  templateUrl: './crear-administrado.component.html',
  styleUrls: ['./crear-administrado.component.css']
})
export class CrearAdministradoComponent implements OnInit, AfterViewInit, OnDestroy {
  modalRef?: BsModalRef;

  p_grutipDoc: string = '01';
  p_grutipPer: string = '02';
  p_codtip: string = '';
  p_dcodtip: string = '';
  crefere: string = '';
  via: string = '';
  haburb: string = '';

  error: string = '';


  datosTipoPersona: any;
  datosTipoDocumento: any;
  datosDistrito: any;
  datosReferencia: any;

  //Variables
  ccontri: string = ''
  ctipper: string = ''
  ctipdoc: string = ''
  dtipdoc: string = ''
  dpatern: string = ''
  dmatern: string = ''
  dnombre: string = ''
  cpostal: string = ''
  ccodurb: string = ''
  dtipurb: string = ''
  dnomurb: string = ''
  ccodvia: string = ''
  dtipvia: string = ''
  dnomvia: string = ''
  dnrofis: string = ''
  dintfis: string = ''
  ddepfis: string = ''
  dletfis: string = ''
  dlotfis: string = ''
  dblofis: string = ''
  dmzafis: string = ''
  drefere: string = ''
  dnumtel: string = ''
  de_mail: string = ''
  dnumcel: string = ''
  fecnaci: string = ''
  cusuari: string = 'N05'


  @ViewChild(DataTableDirective, { static: false }) dtElementModal!: DataTableDirective;

  @Output() confirmClicked = new EventEmitter<any>();

  dtTriggerModal: Subject<void> = new Subject<void>();
  dtOptionsModal: DataTables.Settings = {};
  dtInstance: DataTables.Api | undefined;

  constructor(
    private sigtaService: SigtaService,
    private spinner: NgxSpinnerService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {

    this.listarTipoDocumento();
    this.listarTipoPersona();
    this.listarDistrito();

    this.dtOptionsModal = {
      paging: true,
      pagingType: 'numbers',
      info: false,
      language: {
        url: "//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json"
      },
    }
  }

  ngOnDestroy(): void {
    this.dtTriggerModal.unsubscribe();
  }
  ngAfterViewInit() {
    this.dtTriggerModal.next();
  }

  emitir(id: string): void {
    this.confirmClicked.emit(id);
  }


  validarNumero(event: any): void {
    const keyCode = event.keyCode;
    if (keyCode < 48 || keyCode > 57) {
      event.preventDefault();
    }
  }


  getMaxDate(): string {
    // Obtener la fecha actual en formato "YYYY-MM-DD"
    return new Date().toISOString().split('T')[0];
  }

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
      case '0':
        return 'success';
      default:
        return 'error'; // Puedes establecer un icono predeterminado si no hay coincidencia
    }
  }

  private errorSweetAlertCode(icon: 'error' | 'warning' | 'info' | 'success' = 'error') {
    Swal.fire({
      icon: icon,
      text: this.error || 'Hubo un error al procesar la solicitud',
    });
  }

  confirmClickRefere(value: any) {
    this.dnomvia = value.cdvia;
    this.dnomurb = value.dpoblad;
    this.ccodurb = value.cpoblad;
    this.dtipurb = value.dtippob;
    this.ccodvia = value.v_codi;
    this.dtipvia = value.v_tipo;
    console.log(this.ccodurb);
    console.log(this.dtipurb);
    console.log(this.ccodvia);
    console.log(this.dtipvia);

    // this.obtenerReferencia();
    this.modalService.hide(1);
  }

  asignarPerfil(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { id: 1, class: ' modal-lg modal-bc' });
    // this.modalService.hide(2)
  }

  ChangeTipoDoc(event: any) {
    // this.dtipdoc = event.dcodtip
    this.ctipdoc = event.ccodtip
    console.log(this.ctipdoc)
  }

  ChangeTipoPer(event: any) {
    this.ctipper = event.ccodtip
    console.log(this.ctipper)
  }

  ChangeTipoDistrito(event: any) {
    this.cpostal = event.CPOSTAL
    console.log(this.cpostal)
  }



  onInputChange(event: any) {
    event.target.value = event.target.value.toUpperCase();
  }

  obtenerReferencia() {
    let post = {
      p_desubi: this.crefere,
    };

    console.log(post);

    this.spinner.show();

    this.sigtaService.listarReferencia(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        console.log(data);
        this.datosReferencia = data;
        // this.ccodurb = data[0].cpoblad;
        // this.dtipurb = data[0].dtippob;
        // this.ccodvia = data[0].v_codi;
        // this.dtipvia = data[0].v_tipo;


        this.dtElementModal.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTriggerModal.next();
        });

      },
      error: (error: any) => {
        this.spinner.hide();
        // this.errorSweetAlertCode();
        console.log(error);
      },
    });
  }

  listarTipoDocumento() {
    let post = {
      p_grutip: this.p_grutipDoc,
    };

    this.spinner.show();

    console.log(post);
    this.sigtaService.listarTipoPersona(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        console.log();

        this.datosTipoDocumento = data;
        // this.dtipdoc = data[0].dcodtip
        this.ctipper = data.ccodtip
        console.log(this.ctipper)
      },
      error: (error: any) => {
        console.log(error);
        this.spinner.hide();
      },
    });
  }

  listarTipoPersona() {
    let post = {
      p_grutip: this.p_grutipPer,
    };

    this.spinner.show();

    console.log(post);
    this.sigtaService.listarTipoPersona(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        console.log();

        this.datosTipoPersona = data;
        // this.d
        this.ctipdoc = data[0].ccodtip;
        console.log(this.ctipdoc)
      },
      error: (error: any) => {
        console.log(error);
        this.spinner.hide();
      },
    });
  }

  listarDistrito() {
    let post = {
      // p_grutip: this.p_grutipPer,
    };

    this.spinner.show();

    console.log(post);
    this.sigtaService.listarDistrito(post).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        console.log();

        this.datosDistrito = data;
        this.cpostal = data[0].CPOSTAL
        console.log(this.cpostal)
      },
      error: (error: any) => {
        console.log(error);
        this.spinner.hide();
      },
    });
  }

  registrarAdministrado() {
    let post = {
      ccontri: this.ccontri,
      ctipper: this.ctipper,
      ctipdoc: this.ctipdoc,
      dtipdoc: this.dtipdoc,
      dpatern: this.dpatern,
      dmatern: this.dmatern,
      dnombre: this.dnombre,
      cpostal: this.cpostal,
      ccodurb: this.ccodurb,
      dtipurb: this.dtipurb,
      dnomurb: this.dnomurb,
      ccodvia: this.ccodvia,
      dtipvia: this.dtipvia,
      dnomvia: this.dnomvia,
      dnrofis: this.dnrofis,
      dintfis: this.dintfis,
      ddepfis: this.ddepfis,
      dletfis: this.dletfis,
      dlotfis: this.dlotfis,
      dblofis: this.dblofis,
      dmzafis: this.dmzafis,
      drefere: this.drefere,
      dnumtel: this.dnumtel,
      de_mail: this.de_mail,
      dnumcel: this.dnumcel,
      fecnaci: this.fecnaci,
      cusuari: this.cusuari,
    };

    this.spinner.show();

    this.sigtaService.registrarAdministrado(post).subscribe({

      next: (data: any) => {
        this.spinner.hide();
        console.log(data);

        if (data && data.length > 0 && data[0].error) {
          this.error = data[0].mensa;
          const errorCode = data[0].error;
          console.log(this.error);

          // Selecciona el icono según el código de error
          const icon = this.getIconByErrorCode(errorCode);

          // Muestra el SweetAlert con el icono y el mensaje de error
          this.errorSweetAlertCode(icon);
          // window.location.reload();
        } else {
          this.errorSweetAlertCode();
        }
      },
      error: (error: any) => {
        this.spinner.hide();
        this.errorSweetAlertCode();
        console.log(error);
      },
    });
  }



}