import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { ChartType } from 'chart.js';

// data structure of employee table
interface Employee {
  EmployeeName: string;
  totalTime: number;
}

@Component({
  // @Component tells the angular how to display the component
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, // directories like *ngFor and *ngIf
    HttpClientModule,
    NgChartsModule, // chart module
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  employees: Employee[] = [];

  pieChartLabels: string[] = [];

  pieChartData = {
    labels: ['Employee A', 'Employee B', 'Employee C'],
    datasets: [
      {
        data: [10, 20, 30],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };
  pieChartType: ChartType = 'pie';

  pieChartOptions = {
    // to make chart responsive
    responsive: true,
    maintainAspectRatio: false,
  };

  constructor(private http: HttpClient) {} // to make http req

  generateColors(count: number): string[] {
    const colors = [];
    const baseColors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
      '#8B0000',
      '#008000',
      '#00008B',
    ];
    for (let i = 0; i < count; i++) {
      // displaying colors based on the count
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  }

  ngOnInit() {
    // ngOnInit is like useEffect of react
    this.http
      .get<any[]>(
        'https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ=='
      )
      .subscribe((data) => {
        const employee: { [name: string]: number } = {};

        data.forEach((item) => {
          if (!item.EmployeeName) return;

          const startTime = new Date(item.StarTimeUtc);
          const endTime = new Date(item.EndTimeUtc);
          let hours = (endTime.getTime() - startTime.getTime()) / (1000 * 3600);

          if (!employee[item.EmployeeName]) {
            employee[item.EmployeeName] = 0;
          }
          employee[item.EmployeeName] += hours; // adding hours for the employees
        });

        this.employees = Object.entries(employee) // converting from object to array to access map and sort
          .map(([name, time]) => ({
            EmployeeName: name,
            totalTime: parseFloat(time.toFixed(2)),
          }))
          .sort((a, b) => b.totalTime - a.totalTime);

        // pie chart based on employee name
        this.pieChartLabels = this.employees.map((emp) => emp.EmployeeName);

        this.pieChartData = {
          labels: this.pieChartLabels,
          datasets: [
            {
              data: this.employees.map((emp) => emp.totalTime),
              backgroundColor: this.generateColors(this.employees.length),
            },
          ],
        };
      });
  }
}
