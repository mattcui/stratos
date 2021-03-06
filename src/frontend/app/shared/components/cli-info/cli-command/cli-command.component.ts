import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cli-command',
  templateUrl: './cli-command.component.html',
  styleUrls: ['./cli-command.component.scss']
})
export class CliCommandComponent {

  constructor() { }

  @Input('name') name: string;
  @Input('msg') msg: string;
  @Input('syntax') syntax: string;

}
