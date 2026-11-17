import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-agent.page',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './agent.page.html',
  styleUrl: './agent.page.scss',
})
export class AgentPage {

}
