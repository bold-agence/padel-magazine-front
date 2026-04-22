import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-live-page',
  standalone: true,
  templateUrl: './live.page.html',
  styleUrl: './live.page.scss',
})
export class LivePage implements OnInit, OnDestroy {
  protected timeLeft = {
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isLive: false,
  };

  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.tickCountdown();
    this.timer = setInterval(() => this.tickCountdown(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  protected notifyMe(): void {
    const email = window.prompt('Votre email pour recevoir le rappel :');
    if (email) {
      window.alert('Merci ! Nous vous enverrons un rappel avant le live.');
    }
  }

  private tickCountdown(): void {
    const target = new Date('2026-04-19T15:00:00Z').getTime();
    const delta = target - Date.now();

    if (delta <= 0) {
      this.timeLeft = {
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00',
        isLive: true,
      };
      return;
    }

    const days = Math.floor(delta / 86400000);
    const hours = Math.floor((delta % 86400000) / 3600000);
    const minutes = Math.floor((delta % 3600000) / 60000);
    const seconds = Math.floor((delta % 60000) / 1000);

    this.timeLeft = {
      days: String(days),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      isLive: false,
    };
  }
}
