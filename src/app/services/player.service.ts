import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {PlayerRepresentation} from "../services/api/models/player-representation";
import {Tee} from "../services/api/models/tee";
import { EventRepresentation } from '../services/api/models/event-representation';
import { DonationRepresentation } from '../services/api/models/donation-representation';
import { RewardRepresentation } from '../services/api/models/reward-representation';
import { PlayerScoreRepresentation } from '../services/api/models/playerscore-representation';
import { CourseRepresentation } from '../services/api/models/course-representation';
import { TournamentRepresentation } from '../services/api/models/tournament-representation';
import { SeasonRepresentation } from '../services/api/models/season-representation';
import { NewsRepresentation } from '../services/api/models/news-representation';
import { StandingRepresentation } from '../services/api/models/standing-representation';
import { EventScoreDetail } from '../services/api/models/event-score-detail';
@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private localServerSideUrl = 'http://localhost:8080/';
  private baseUrl = this.getHost();


  constructor(private http: HttpClient) { }

  getHost(): string {
      if (window.location.port=='4200') {
        return this.localServerSideUrl;
        //return  window.location.protocol + '//' + window.location.host+'/';
      } else {
        return  window.location.protocol + '//' + window.location.host+'/';
      }


  }



  getAllPlayer() {
    const playersUrl = `${this.baseUrl}webapi/players`;
    return this.http.get<Array<PlayerRepresentation>>(playersUrl);
  }

  savePlayer(data:any) {
    const playersUrl = `${this.baseUrl}webapi/admin/players`;
    return this.http.post(playersUrl, data, { withCredentials: true });
  }

  editPlayer(data:any) {
    const playersUrl = `${this.baseUrl}webapi/admin/players`;
    return this.http.post(playersUrl, data, { withCredentials: true });
  }

  getPlayerById(id:any) {
    const playersUrl = `${this.baseUrl}webapi/players/`+id;
    return this.http.get<PlayerRepresentation>(playersUrl);

  }

  updatePlayersHandicap(data:any) {
    const playersUrl = `${this.baseUrl}webapi/players/ghin`;
    return this.http.post(playersUrl, data);
  }

  createEventTee(event: EventRepresentation) {
    const eventGroupUrl = `${this.baseUrl}webapi/admin/game/grouping`;
    console.log("eventGroupUrl="+eventGroupUrl);
    return this.http.post(eventGroupUrl, event, { withCredentials: true });
  }

  getAllEvent() {
    const eventsUrl = `${this.baseUrl}webapi/events`;
    return this.http.get<Array<EventRepresentation>>(eventsUrl);
  }

  getEventById(id:any) {
    const eventsUrl = `${this.baseUrl}webapi/events/`+id;
    return this.http.get<EventRepresentation>(eventsUrl);
  }

  getUpcomingEvent() {
    const eventsUrl = `${this.baseUrl}webapi/events/upcoming`;
    return this.http.get<EventRepresentation>(eventsUrl);
  }
  
  getOngoingEvent() {
    const eventUrl = `${this.baseUrl}webapi/events/find/ongoing`;
    return this.http.get<EventRepresentation>(eventUrl);
  }

  submitScore(event: EventRepresentation) {
    const submitScoreUrl = `${this.baseUrl}webapi/admin/game/submitScore`;
    console.log("eventGroupUrl="+submitScoreUrl);
    return this.http.post(submitScoreUrl, event, { withCredentials: true });
  }

  updateLast3Score() {
    const updateScoreUrl = `${this.baseUrl}webapi/player/last3score`;
    return this.http.get(updateScoreUrl);
  }

  getDonations() {
    return this.http.get<Array<DonationRepresentation>>(`${this.baseUrl}webapi/donations`);
  }

  createDonation(data: DonationRepresentation) {
    return this.http.post<DonationRepresentation>(`${this.baseUrl}webapi/donations`, data);
  }

  updateDonation(id: number, data: DonationRepresentation) {
    return this.http.put<DonationRepresentation>(`${this.baseUrl}webapi/donations/${id}`, data);
  }

  deleteDonation(id: number) {
    return this.http.delete(`${this.baseUrl}webapi/donations/${id}`);
  }

  getCourses() {
    return this.http.get<Array<CourseRepresentation>>(`${this.baseUrl}webapi/courses`);
  }

  getSeasons() {
    return this.http.get<Array<SeasonRepresentation>>(`${this.baseUrl}webapi/seasons`);
  }

  createEvent(data: EventRepresentation) {
    return this.http.post<EventRepresentation>(`${this.baseUrl}webapi/admin/events`, data, { withCredentials: true });
  }

  updateEvent(id: number, data: EventRepresentation) {
    return this.http.put<EventRepresentation>(`${this.baseUrl}webapi/admin/events/${id}`, data, { withCredentials: true });
  }

  deleteEvent(id: number) {
    return this.http.delete(`${this.baseUrl}webapi/admin/events/${id}`, { withCredentials: true });
  }

  getLatestEvent() {
    const eventsUrl = `${this.baseUrl}webapi/events/latest`;
    return this.http.get<Array<EventRepresentation>>(eventsUrl);
  }

  getLatestRewards(eventId:any) {
    return this.http.get<Array<RewardRepresentation>>(`${this.baseUrl}webapi/rewards?eventId=${eventId}`);
  }

  getAllRewards() {
    return this.http.get<Array<RewardRepresentation>>(`${this.baseUrl}webapi/rewards/all`);
  }

  createReward(reward: RewardRepresentation) {
    return this.http.post<RewardRepresentation>(`${this.baseUrl}webapi/rewards`, reward, { withCredentials: true });
  }

  updateReward(id: number, reward: RewardRepresentation) {
    return this.http.put<RewardRepresentation>(`${this.baseUrl}webapi/rewards/${id}`, reward, { withCredentials: true });
  }

  deleteReward(id: number) {
    return this.http.delete(`${this.baseUrl}webapi/rewards/${id}`, { withCredentials: true });
  }

  getLatestPlayerScores(eventId:any) {
    const scoreUrl = `${this.baseUrl}webapi/event/score?eventId=`+eventId;
    return this.http.get<Array<PlayerScoreRepresentation>>(scoreUrl);
  }

  submitScores(data:any) {
    const submitscoreUrl = `${this.baseUrl}webapi/event/scores`;
    return this.http.post<Array<PlayerScoreRepresentation>>(submitscoreUrl, data);
  }

  onboardPlayerScores(data:any) {
    
    const onboardPlayerScoresUrl = `${this.baseUrl}webapi/event/create/playerscores`;
    console.log('url='+onboardPlayerScoresUrl);
    return this.http.post<Array<PlayerScoreRepresentation>>(onboardPlayerScoresUrl, data);
  }

  getNews() {
    return this.http.get<NewsRepresentation[]>(`${this.baseUrl}webapi/news`);
  }

  getAllNews() {
    return this.http.get<NewsRepresentation[]>(`${this.baseUrl}webapi/news/all`);
  }

  createNews(data: NewsRepresentation) {
    return this.http.post<NewsRepresentation>(`${this.baseUrl}webapi/admin/news`, data, { withCredentials: true });
  }

  updateNews(id: number, data: NewsRepresentation) {
    return this.http.put<NewsRepresentation>(`${this.baseUrl}webapi/admin/news/${id}`, data, { withCredentials: true });
  }

  deleteNews(id: number) {
    return this.http.delete(`${this.baseUrl}webapi/admin/news/${id}`, { withCredentials: true });
  }

  getStandings() {
    return this.http.get<StandingRepresentation[]>(`${this.baseUrl}webapi/points/standings`);
  }

  calculatePoints() {
    return this.http.post(`${this.baseUrl}webapi/admin/points/calculate`, {}, { withCredentials: true });
  }

  getGameScores() {
    return this.http.get<EventScoreDetail[]>(`${this.baseUrl}webapi/points/game-scores`);
  }

  getEventScoreDetail(eventId: number) {
    return this.http.get<EventScoreDetail>(`${this.baseUrl}webapi/points/game-scores/event/${eventId}`);
  }

  getTournamentScoreDetails(tournamentId: number) {
    return this.http.get<EventScoreDetail[]>(`${this.baseUrl}webapi/points/game-scores/tournament/${tournamentId}`);
  }

  getCarouselPhotos(count = 20) {
    return this.http.get<any[]>(`${this.baseUrl}webapi/photos/random?count=${count}`);
  }

  getEventIdsWithPhotos() {
    return this.http.get<{ id: number }[]>(`${this.baseUrl}webapi/photos/events`);
  }

  getEventPhotos(eventId: number) {
    return this.http.get<any[]>(`${this.baseUrl}webapi/photos/event/${eventId}`);
  }

  // ── Game Plan ─────────────────────────────────────────────────────────────

  getRosterPlayers(eventId: number) {
    return this.http.get<PlayerRepresentation[]>(`${this.baseUrl}webapi/gameplan/${eventId}/players`);
  }

  addPlayersToRoster(eventId: number, playerIds: number[]) {
    return this.http.post(`${this.baseUrl}webapi/admin/gameplan/${eventId}/players`, playerIds, { withCredentials: true });
  }

  removePlayerFromRoster(eventId: number, playerId: number) {
    return this.http.delete(`${this.baseUrl}webapi/admin/gameplan/${eventId}/players/${playerId}`, { withCredentials: true });
  }

  clearGroups(eventId: number) {
    return this.http.delete(`${this.baseUrl}webapi/admin/gameplan/${eventId}/groups`, { withCredentials: true });
  }

  getUnassignedPlayers(eventId: number) {
    return this.http.get<PlayerRepresentation[]>(`${this.baseUrl}webapi/gameplan/${eventId}/unassigned`);
  }

  removePlayerFromTee(playerScoreId: number) {
    return this.http.delete(`${this.baseUrl}webapi/admin/gameplan/playerscore/${playerScoreId}`, { withCredentials: true });
  }

  assignPlayer(eventId: number, playerId: number) {
    return this.http.post(`${this.baseUrl}webapi/admin/gameplan/${eventId}/players/${playerId}/assign`, {}, { withCredentials: true });
  }

  generateGroups(eventId: number, strategy: string) {
    return this.http.post<any[]>(`${this.baseUrl}webapi/admin/gameplan/${eventId}/generate`, { strategy }, { withCredentials: true });
  }

  getGroups(eventId: number) {
    return this.http.get<any[]>(`${this.baseUrl}webapi/gameplan/${eventId}/groups`);
  }

  updateTee(teeId: number, data: { teeName?: string; teeTime?: string }) {
    return this.http.put(`${this.baseUrl}webapi/admin/gameplan/tee/${teeId}`, data, { withCredentials: true });
  }

  deleteTee(teeId: number) {
    return this.http.delete(`${this.baseUrl}webapi/admin/gameplan/tee/${teeId}`, { withCredentials: true });
  }

  movePlayerToGroup(playerScoreId: number, teeId: number) {
    return this.http.put(`${this.baseUrl}webapi/admin/gameplan/playerscore/${playerScoreId}/tee/${teeId}`, {}, { withCredentials: true });
  }

  updateEventStatus(eventId: number, status: string) {
    return this.http.put(`${this.baseUrl}webapi/admin/events/${eventId}/status`, { status }, { withCredentials: true });
  }

  // ── Tournament CRUD ───────────────────────────────────────────────────────

  getTournaments() {
    return this.http.get<TournamentRepresentation[]>(`${this.baseUrl}webapi/tournaments`);
  }

  createTournament(data: TournamentRepresentation) {
    return this.http.post<TournamentRepresentation>(`${this.baseUrl}webapi/admin/tournaments`, data, { withCredentials: true });
  }

  updateTournament(id: number, data: TournamentRepresentation) {
    return this.http.put<TournamentRepresentation>(`${this.baseUrl}webapi/admin/tournaments/${id}`, data, { withCredentials: true });
  }

  deleteTournament(id: number) {
    return this.http.delete(`${this.baseUrl}webapi/admin/tournaments/${id}`, { withCredentials: true });
  }

  addEventToTournament(tournamentId: number, eventId: number) {
    return this.http.post(`${this.baseUrl}webapi/admin/tournaments/${tournamentId}/events/${eventId}`, {}, { withCredentials: true });
  }

  removeEventFromTournament(tournamentId: number, eventId: number) {
    return this.http.delete(`${this.baseUrl}webapi/admin/tournaments/${tournamentId}/events/${eventId}`, { withCredentials: true });
  }

  createEventUnderTournament(tournamentId: number, data: any) {
    return this.http.post<any>(`${this.baseUrl}webapi/admin/tournaments/${tournamentId}/events`, data, { withCredentials: true });
  }

  // ── Course CRUD ───────────────────────────────────────────────────────────

  createCourse(data: CourseRepresentation) {
    return this.http.post<CourseRepresentation>(`${this.baseUrl}webapi/admin/courses`, data, { withCredentials: true });
  }

  updateCourse(id: number, data: CourseRepresentation) {
    return this.http.put<CourseRepresentation>(`${this.baseUrl}webapi/admin/courses/${id}`, data, { withCredentials: true });
  }

  deleteCourse(id: number) {
    return this.http.delete(`${this.baseUrl}webapi/admin/courses/${id}`, { withCredentials: true });
  }
}
