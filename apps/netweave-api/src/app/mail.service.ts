import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { tap } from 'rxjs';
import { LogEntry } from './fetch.service';


@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly logDir = process.env.LOG_DIR || join(process.cwd(), 'apps', 'netweave-api');

    constructor(private readonly httpService: HttpService) {
        this.logger.log(`MailService initialized`);
    }

    @Cron('* * * * *')
    public async sendMail() {

        this.logger.log(`Trying to send Mail...`);

        // read last entry and log it
        const lastEntry = await this.readLastLineFromFile();

        return this.httpService.post('https://api.resend.com/emails', {
            from: "Marvin Frede<info@netweave.de>",
            to: ["marvinfrede@gmx.de"],
            subject: `Netweave: message from ${lastEntry.data.author}`,
            html: `<p>${lastEntry.data.quote}</p>`
        }, {
            headers: {
                Authorization: 'Bearer re_GaTXtT5J_9DfFzU7xvUiJxfYaWC1uG6YZ', // TODO hide, put in .env
                'Content-Type': 'application/json',
            }
        }).pipe(
            tap(() => this.logger.log(`Mail Post successfully`))
        ).subscribe();
    }

    private async readLastLineFromFile(): Promise<LogEntry> {
        const filePath = join(this.logDir, 'response-log.txt');
        const contents = await readFile(filePath, 'utf-8');
        const lines = contents.trim().split(/\r?\n/);
        const last = lines.pop() || '';
        if (!last) {
            throw new Error('log file is empty');
        }
        return JSON.parse(last) as LogEntry;
    }
}
