import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { Response } from 'express';
import { PDF_COLORS, PDF_FONTS, PDF_LAYOUT } from './pdf-styles.constants';
import { AmendmentCalculator } from '../utils/amendment-calculator.util';
import {
  SoilAnalysisReportData,
  ReportHeader,
  SoilAnalysisSection,
  SoilHealthDiagnosis,
  CropRecommendationSection,
  AmendmentRecommendation,
  FertilizationPlanEntry,
  PlantingCalendarEntry,
  RegionalContextSection,
} from '../interfaces/report-data.interface';

/**
 * Service de generation de PDF pour les rapports d'analyse de sol
 * Utilise PDFKit pour generer des rapports professionnels
 */
@Injectable()
export class PdfGeneratorService {
  private sectionNumber = 0;

  /**
   * Genere et streame le PDF vers la reponse HTTP
   */
  generatePdf(reportData: SoilAnalysisReportData, res: Response): void {
    this.sectionNumber = 0;

    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: PDF_LAYOUT.marginTop,
        bottom: PDF_LAYOUT.marginBottom,
        left: PDF_LAYOUT.marginLeft,
        right: PDF_LAYOUT.marginRight,
      },
      info: {
        Title: `Rapport d'Analyse de Sol - ${reportData.header.landTitle}`,
        Author: 'AgriLand - Plateforme Agricole du Senegal',
        Subject: 'Analyse de Sol et Recommandations Agronomiques',
      },
      bufferPages: true,
    });

    const filename = `rapport-sol-${reportData.header.landId}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Rendu des sections
    this.renderCoverPage(doc, reportData.header);
    doc.addPage();
    this.renderSoilAnalysis(doc, reportData.soilAnalysis);
    this.renderHealthDiagnosis(doc, reportData.soilHealthDiagnosis);
    this.renderCropRecommendations(doc, reportData.cropRecommendations);
    this.renderAmendments(doc, reportData.amendmentRecommendations, reportData.header.surfaceHectares);
    this.renderFertilizationPlan(doc, reportData.fertilizationPlan);
    this.renderPlantingCalendar(doc, reportData.plantingCalendar);
    this.renderConservationTips(doc, reportData.conservationTips);
    this.renderRegionalContext(doc, reportData.regionalContext);

    // Ajout des numeros de page
    this.addPageNumbers(doc);

    doc.end();
  }

  // =============================================
  // PAGE DE COUVERTURE
  // =============================================

  private renderCoverPage(doc: PDFKit.PDFDocument, header: ReportHeader): void {
    const cx = PDF_LAYOUT.pageWidth / 2;

    // Bandeau vert en haut
    doc.rect(0, 0, PDF_LAYOUT.pageWidth, 120).fill(PDF_COLORS.primary);

    doc.fillColor(PDF_COLORS.white)
      .fontSize(10)
      .text('AGRILAND', PDF_LAYOUT.marginLeft, 25, { align: 'left' })
      .fontSize(8)
      .text('Plateforme Agricole du Senegal', PDF_LAYOUT.marginLeft, 40);

    doc.fontSize(8)
      .text(this.formatDate(header.generatedAt), 0, 25, {
        align: 'right',
        width: PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginRight,
      });

    // Titre principal
    doc.fillColor(PDF_COLORS.white)
      .fontSize(PDF_FONTS.titleSize)
      .text('RAPPORT D\'ANALYSE DE SOL', PDF_LAYOUT.marginLeft, 65, {
        align: 'center',
        width: PDF_LAYOUT.contentWidth,
      });

    doc.fontSize(PDF_FONTS.subtitleSize)
      .text('Recommandations Agronomiques', PDF_LAYOUT.marginLeft, 95, {
        align: 'center',
        width: PDF_LAYOUT.contentWidth,
      });

    // Informations de la parcelle
    let y = 160;
    doc.fillColor(PDF_COLORS.primary)
      .fontSize(PDF_FONTS.sectionTitleSize)
      .text('Informations de la parcelle', PDF_LAYOUT.marginLeft, y);

    y += 30;
    doc.rect(PDF_LAYOUT.marginLeft, y, PDF_LAYOUT.contentWidth, 1).fill(PDF_COLORS.accent);
    y += 15;

    const infoData = [
      ['Titre de l\'annonce', header.landTitle],
      ['Proprietaire', header.ownerName],
      ['Telephone', header.ownerPhone || 'Non renseigne'],
      ['Region', header.region || 'Non renseignee'],
      ['Commune', header.commune || 'Non renseignee'],
      ['Village', header.village || '-'],
      ['Surface', `${header.surfaceHectares} hectares`],
      ['Coordonnees GPS', `${header.coordinates.latitude.toFixed(4)}° N, ${Math.abs(header.coordinates.longitude).toFixed(4)}° W`],
      ['Date du rapport', this.formatDate(header.generatedAt)],
    ];

    for (const [label, value] of infoData) {
      doc.fillColor(PDF_COLORS.textLight).fontSize(PDF_FONTS.bodySize).text(label, PDF_LAYOUT.marginLeft + 10, y);
      doc.fillColor(PDF_COLORS.textDark).text(value as string, PDF_LAYOUT.marginLeft + 170, y);
      y += 20;
    }

    // Sommaire
    y += 20;
    doc.fillColor(PDF_COLORS.primary)
      .fontSize(PDF_FONTS.sectionTitleSize)
      .text('Sommaire', PDF_LAYOUT.marginLeft, y);

    y += 25;
    doc.rect(PDF_LAYOUT.marginLeft, y, PDF_LAYOUT.contentWidth, 1).fill(PDF_COLORS.accent);
    y += 15;

    const sommaire = [
      '1. Resultats de l\'analyse du sol',
      '2. Diagnostic de sante du sol',
      '3. Recommandations de cultures',
      '4. Amendements recommandes',
      '5. Plan de fertilisation',
      '6. Calendrier cultural',
      '7. Conseils de conservation du sol',
      '8. Contexte regional',
    ];

    for (const item of sommaire) {
      doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize).text(item, PDF_LAYOUT.marginLeft + 10, y);
      y += 18;
    }

    // Pied de page couverture
    doc.fillColor(PDF_COLORS.textLight)
      .fontSize(PDF_FONTS.smallSize)
      .text(
        'Ce rapport est genere automatiquement par AgriLand sur la base des parametres du sol fournis. Les recommandations sont indicatives et doivent etre adaptees aux conditions locales.',
        PDF_LAYOUT.marginLeft,
        PDF_LAYOUT.pageHeight - 100,
        { width: PDF_LAYOUT.contentWidth, align: 'center' },
      );
  }

  // =============================================
  // ANALYSE DU SOL
  // =============================================

  private renderSoilAnalysis(doc: PDFKit.PDFDocument, analysis: SoilAnalysisSection): void {
    this.renderSectionTitle(doc, 'Resultats de l\'analyse du sol');

    const params = [
      { label: 'pH', data: analysis.ph },
      { label: 'Azote (N)', data: analysis.nitrogen },
      { label: 'Phosphore (P)', data: analysis.phosphorus },
      { label: 'Potassium (K)', data: analysis.potassium },
    ];

    for (const param of params) {
      this.checkPageBreak(doc, 80);
      this.renderParameterBlock(doc, param.label, param.data.value, param.data.level, param.data.interpretation);
    }

    // Texture
    this.checkPageBreak(doc, 80);
    this.renderParameterBlock(doc, 'Texture du sol', analysis.texture.value, '', analysis.texture.interpretation);

    // Drainage
    this.checkPageBreak(doc, 80);
    this.renderParameterBlock(doc, 'Drainage', analysis.drainage.value, '', analysis.drainage.interpretation);

    // Humidite
    this.checkPageBreak(doc, 80);
    this.renderParameterBlock(doc, 'Humidite', `${analysis.moisture.value}%`, analysis.moisture.level, analysis.moisture.interpretation);

    // Matiere organique
    if (analysis.organicMatter) {
      this.checkPageBreak(doc, 80);
      this.renderParameterBlock(doc, 'Matiere organique', `${analysis.organicMatter.value}%`, analysis.organicMatter.level, analysis.organicMatter.interpretation);
    }

    // Salinite
    if (analysis.salinity) {
      this.checkPageBreak(doc, 80);
      this.renderParameterBlock(doc, 'Salinite', `${analysis.salinity.value} dS/m`, analysis.salinity.level, analysis.salinity.interpretation);
    }

    // CEC
    if (analysis.cec) {
      this.checkPageBreak(doc, 80);
      this.renderParameterBlock(doc, 'CEC', `${analysis.cec.value} meq/100g`, analysis.cec.level, analysis.cec.interpretation);
    }
  }

  private renderParameterBlock(
    doc: PDFKit.PDFDocument,
    label: string,
    value: string | number,
    level: string,
    interpretation: string,
  ): void {
    const x = PDF_LAYOUT.marginLeft;
    let y = doc.y + 5;

    // Fond clair
    doc.rect(x, y, PDF_LAYOUT.contentWidth, 65).fill(PDF_COLORS.sectionBg);

    y += 8;

    // Label et valeur
    doc.fillColor(PDF_COLORS.primary).fontSize(PDF_FONTS.subSectionSize).text(label, x + 10, y);

    const valueStr = typeof value === 'number' ? value.toString() : value;
    doc.fillColor(PDF_COLORS.textDark).fontSize(PDF_FONTS.subSectionSize).text(valueStr, x + 200, y);

    // Badge niveau
    if (level) {
      const badgeColor = this.getLevelColor(level);
      const badgeX = x + 300;
      const badgeWidth = doc.widthOfString(level) + 16;
      doc.roundedRect(badgeX, y - 2, badgeWidth, 18, 3).fill(badgeColor);
      doc.fillColor(PDF_COLORS.white).fontSize(PDF_FONTS.smallSize).text(level, badgeX + 8, y + 2);
    }

    // Interpretation
    y += 22;
    doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.smallSize).text(interpretation, x + 10, y, {
      width: PDF_LAYOUT.contentWidth - 20,
    });

    doc.y = y + 30;
  }

  // =============================================
  // DIAGNOSTIC SANTE
  // =============================================

  private renderHealthDiagnosis(doc: PDFKit.PDFDocument, diagnosis: SoilHealthDiagnosis): void {
    this.checkPageBreak(doc, 200);
    this.renderSectionTitle(doc, 'Diagnostic de sante du sol');

    const x = PDF_LAYOUT.marginLeft;
    let y = doc.y + 5;

    // Score global
    const scoreColor = this.getScoreColor(diagnosis.overallScore);
    doc.rect(x, y, PDF_LAYOUT.contentWidth, 50).fill(PDF_COLORS.sectionBg);

    doc.fillColor(PDF_COLORS.textDark)
      .fontSize(PDF_FONTS.subSectionSize)
      .text('Score global de sante du sol :', x + 10, y + 8);

    doc.fillColor(scoreColor)
      .fontSize(20)
      .text(`${diagnosis.overallScore}/100`, x + 250, y + 4);

    const levelBadgeColor = this.getLevelColor(diagnosis.overallLevel.toLowerCase());
    const levelBadgeWidth = doc.widthOfString(diagnosis.overallLevel) + 20;
    doc.roundedRect(x + 330, y + 8, levelBadgeWidth, 22, 3).fill(levelBadgeColor);
    doc.fillColor(PDF_COLORS.white).fontSize(PDF_FONTS.bodySize).text(diagnosis.overallLevel, x + 340, y + 12);

    y += 55;

    // Resume
    doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize).text(diagnosis.summary, x + 10, y, {
      width: PDF_LAYOUT.contentWidth - 20,
    });
    y = doc.y + 15;

    // Points forts
    if (diagnosis.strengths.length > 0) {
      this.checkPageBreak(doc, 20 + diagnosis.strengths.length * 18);
      doc.fillColor(PDF_COLORS.bon).fontSize(PDF_FONTS.subSectionSize).text('Points forts', x, doc.y);
      doc.y += 5;
      for (const strength of diagnosis.strengths) {
        doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize).text(`  + ${strength}`, x + 10, doc.y);
        doc.y += 3;
      }
      doc.y += 10;
    }

    // Points faibles
    if (diagnosis.weaknesses.length > 0) {
      this.checkPageBreak(doc, 20 + diagnosis.weaknesses.length * 18);
      doc.fillColor(PDF_COLORS.deficient).fontSize(PDF_FONTS.subSectionSize).text('Points a ameliorer', x, doc.y);
      doc.y += 5;
      for (const weakness of diagnosis.weaknesses) {
        doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize).text(`  - ${weakness}`, x + 10, doc.y);
        doc.y += 3;
      }
      doc.y += 10;
    }
  }

  // =============================================
  // RECOMMANDATIONS DE CULTURES
  // =============================================

  private renderCropRecommendations(doc: PDFKit.PDFDocument, crops: CropRecommendationSection[]): void {
    this.checkPageBreak(doc, 100);
    this.renderSectionTitle(doc, 'Recommandations de cultures');

    if (crops.length === 0) {
      doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize)
        .text('Aucune culture recommandee pour les parametres du sol actuels.', PDF_LAYOUT.marginLeft + 10, doc.y);
      doc.y += 20;
      return;
    }

    doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize)
      .text(
        `Sur la base de l'analyse du sol, ${crops.length} culture(s) sont recommandees, classees par ordre de compatibilite :`,
        PDF_LAYOUT.marginLeft + 10,
        doc.y,
        { width: PDF_LAYOUT.contentWidth - 20 },
      );
    doc.y += 10;

    for (const crop of crops) {
      this.checkPageBreak(doc, 80);
      this.renderCropCard(doc, crop);
    }
  }

  private renderCropCard(doc: PDFKit.PDFDocument, crop: CropRecommendationSection): void {
    const x = PDF_LAYOUT.marginLeft;
    let y = doc.y + 3;

    const cardHeight = 55 + (crop.reasons.length > 3 ? 10 : 0);
    doc.rect(x, y, PDF_LAYOUT.contentWidth, cardHeight).fill(PDF_COLORS.sectionBg);

    // Ligne laterale coloree
    const suitColor = this.getSuitabilityColor(crop.suitability);
    doc.rect(x, y, 4, cardHeight).fill(suitColor);

    y += 8;

    // Rang + nom
    doc.fillColor(PDF_COLORS.primary).fontSize(PDF_FONTS.subSectionSize)
      .text(`#${crop.rank} ${crop.name}`, x + 12, y);

    // Score
    doc.fillColor(suitColor).fontSize(PDF_FONTS.bodySize)
      .text(`Score: ${crop.score}/100 (${crop.suitability})`, x + 280, y);

    y += 18;

    // Saison et rendement
    doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.smallSize)
      .text(`Saison : ${crop.season}`, x + 12, y)
      .text(`Rendement attendu : ${crop.expectedYield}`, x + 200, y);

    y += 14;

    // Raisons
    const reasonsText = crop.reasons.slice(0, 4).join(' | ');
    doc.fillColor(PDF_COLORS.textLight).fontSize(PDF_FONTS.smallSize)
      .text(reasonsText, x + 12, y, { width: PDF_LAYOUT.contentWidth - 30 });

    doc.y = y + 18;
  }

  // =============================================
  // AMENDEMENTS
  // =============================================

  private renderAmendments(doc: PDFKit.PDFDocument, amendments: AmendmentRecommendation[], surface: number): void {
    this.checkPageBreak(doc, 100);
    this.renderSectionTitle(doc, 'Amendements recommandes');

    if (amendments.length === 0) {
      doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize)
        .text('Aucun amendement particulier n\'est necessaire. Le sol presente des conditions satisfaisantes.', PDF_LAYOUT.marginLeft + 10, doc.y);
      doc.y += 20;
      return;
    }

    doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize)
      .text(
        `Les amendements suivants sont recommandes pour ameliorer la fertilite du sol (surface: ${surface} ha) :`,
        PDF_LAYOUT.marginLeft + 10,
        doc.y,
        { width: PDF_LAYOUT.contentWidth - 20 },
      );
    doc.y += 10;

    let totalCost = 0;

    for (const amendment of amendments) {
      this.checkPageBreak(doc, 90);
      this.renderAmendmentCard(doc, amendment);
      totalCost += amendment.totalEstimatedCost;
    }

    // Cout total
    this.checkPageBreak(doc, 40);
    const x = PDF_LAYOUT.marginLeft;
    doc.rect(x, doc.y + 5, PDF_LAYOUT.contentWidth, 30).fill(PDF_COLORS.primary);
    doc.fillColor(PDF_COLORS.white).fontSize(PDF_FONTS.subSectionSize)
      .text('Cout total estime des amendements :', x + 10, doc.y + 13)
      .text(AmendmentCalculator.formatFCFA(totalCost), x + 300, doc.y + 1);
    doc.y += 45;
  }

  private renderAmendmentCard(doc: PDFKit.PDFDocument, amendment: AmendmentRecommendation): void {
    const x = PDF_LAYOUT.marginLeft;
    let y = doc.y + 3;

    doc.rect(x, y, PDF_LAYOUT.contentWidth, 75).fill(PDF_COLORS.sectionBg);

    // Ligne laterale priorite
    const prioColor = PDF_COLORS[amendment.priority] || PDF_COLORS.moyenne;
    doc.rect(x, y, 4, 75).fill(prioColor);

    y += 8;

    // Type + priorite
    doc.fillColor(PDF_COLORS.primary).fontSize(PDF_FONTS.subSectionSize)
      .text(amendment.type, x + 12, y);

    const prioLabel = `Priorite ${amendment.priority}`;
    const prioBadgeWidth = doc.widthOfString(prioLabel) + 16;
    doc.roundedRect(x + PDF_LAYOUT.contentWidth - prioBadgeWidth - 10, y - 2, prioBadgeWidth, 18, 3).fill(prioColor);
    doc.fillColor(PDF_COLORS.white).fontSize(PDF_FONTS.smallSize)
      .text(prioLabel, x + PDF_LAYOUT.contentWidth - prioBadgeWidth - 2, y + 2);

    y += 18;

    // Produit
    doc.fillColor(PDF_COLORS.textDark).fontSize(PDF_FONTS.bodySize)
      .text(`Produit : ${amendment.product}`, x + 12, y);

    y += 14;

    // Quantite et cout
    doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.smallSize)
      .text(`Dose : ${amendment.quantityPerHectare}`, x + 12, y)
      .text(`Total : ${amendment.totalQuantity}`, x + 200, y)
      .text(`Cout : ${AmendmentCalculator.formatFCFA(amendment.totalEstimatedCost)}`, x + 370, y);

    y += 12;

    // Raison
    doc.fillColor(PDF_COLORS.textLight).fontSize(PDF_FONTS.smallSize)
      .text(amendment.reason, x + 12, y, { width: PDF_LAYOUT.contentWidth - 30 });

    doc.y = y + 18;
  }

  // =============================================
  // PLAN DE FERTILISATION
  // =============================================

  private renderFertilizationPlan(doc: PDFKit.PDFDocument, plan: FertilizationPlanEntry[]): void {
    this.checkPageBreak(doc, 100);
    this.renderSectionTitle(doc, 'Plan de fertilisation');

    if (plan.length === 0) {
      doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize)
        .text('Pas de plan de fertilisation specifique a generer.', PDF_LAYOUT.marginLeft + 10, doc.y);
      doc.y += 20;
      return;
    }

    for (const entry of plan) {
      this.checkPageBreak(doc, 70);

      const x = PDF_LAYOUT.marginLeft;
      let y = doc.y + 3;

      doc.rect(x, y, PDF_LAYOUT.contentWidth, 55).fill(PDF_COLORS.sectionBg);

      y += 8;
      doc.fillColor(PDF_COLORS.primary).fontSize(PDF_FONTS.tableCellSize + 1)
        .text(entry.period, x + 10, y, { bold: true } as any);

      y += 14;
      doc.fillColor(PDF_COLORS.textDark).fontSize(PDF_FONTS.tableCellSize)
        .text(`Action : ${entry.action}`, x + 10, y);

      y += 12;
      doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.smallSize)
        .text(`Produit : ${entry.product}  |  Dose : ${entry.quantity}`, x + 10, y);

      if (entry.targetCrops.length > 0) {
        y += 10;
        doc.fillColor(PDF_COLORS.textLight).fontSize(PDF_FONTS.smallSize)
          .text(`Cultures ciblees : ${entry.targetCrops.join(', ')}`, x + 10, y);
      }

      doc.y = y + 16;
    }
  }

  // =============================================
  // CALENDRIER CULTURAL
  // =============================================

  private renderPlantingCalendar(doc: PDFKit.PDFDocument, calendar: PlantingCalendarEntry[]): void {
    this.checkPageBreak(doc, 100);
    this.renderSectionTitle(doc, 'Calendrier cultural');

    doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize)
      .text(
        'Calendrier des activites agricoles et des cultures recommandees par mois, adapte au contexte senegalais :',
        PDF_LAYOUT.marginLeft + 10,
        doc.y,
        { width: PDF_LAYOUT.contentWidth - 20 },
      );
    doc.y += 10;

    for (const entry of calendar) {
      // Estimer la hauteur
      const activitiesCount = entry.activities.length;
      const estimatedHeight = 35 + activitiesCount * 12 + (entry.recommendedCrops.length > 0 ? 14 : 0);
      this.checkPageBreak(doc, estimatedHeight);

      const x = PDF_LAYOUT.marginLeft;
      let y = doc.y + 2;

      const isHivernage = entry.season.toLowerCase().includes('hivernage');
      const bgColor = isHivernage ? '#E8F5E9' : '#FFF8E1';
      doc.rect(x, y, PDF_LAYOUT.contentWidth, estimatedHeight).fill(bgColor);

      y += 6;

      // Mois et saison
      doc.fillColor(PDF_COLORS.primary).fontSize(PDF_FONTS.tableCellSize + 1)
        .text(entry.month, x + 10, y);
      doc.fillColor(PDF_COLORS.textLight).fontSize(PDF_FONTS.smallSize)
        .text(entry.season, x + 100, y + 1);

      y += 16;

      // Activites
      for (const activity of entry.activities.slice(0, 4)) {
        doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.smallSize)
          .text(`  - ${activity}`, x + 10, y, { width: PDF_LAYOUT.contentWidth - 30 });
        y += 11;
      }

      // Cultures
      if (entry.recommendedCrops.length > 0) {
        doc.fillColor(PDF_COLORS.secondary).fontSize(PDF_FONTS.smallSize)
          .text(`  Cultures : ${entry.recommendedCrops.join(', ')}`, x + 10, y);
        y += 12;
      }

      doc.y = y + 4;
    }
  }

  // =============================================
  // CONSEILS DE CONSERVATION
  // =============================================

  private renderConservationTips(doc: PDFKit.PDFDocument, tips: string[]): void {
    this.checkPageBreak(doc, 80);
    this.renderSectionTitle(doc, 'Conseils de conservation du sol');

    if (tips.length === 0) return;

    const x = PDF_LAYOUT.marginLeft;

    for (let i = 0; i < tips.length; i++) {
      this.checkPageBreak(doc, 30);

      const y = doc.y + 3;
      const bgColor = i % 2 === 0 ? PDF_COLORS.sectionBg : PDF_COLORS.white;

      // Calculer la hauteur du texte
      const textHeight = doc.heightOfString(tips[i], { width: PDF_LAYOUT.contentWidth - 40 });
      const blockHeight = textHeight + 12;

      doc.rect(x, y, PDF_LAYOUT.contentWidth, blockHeight).fill(bgColor);

      doc.fillColor(PDF_COLORS.secondary).fontSize(PDF_FONTS.bodySize)
        .text(`${i + 1}.`, x + 10, y + 6);

      doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize)
        .text(tips[i], x + 30, y + 6, { width: PDF_LAYOUT.contentWidth - 40 });

      doc.y = y + blockHeight + 2;
    }
  }

  // =============================================
  // CONTEXTE REGIONAL
  // =============================================

  private renderRegionalContext(doc: PDFKit.PDFDocument, context: RegionalContextSection): void {
    this.checkPageBreak(doc, 150);
    this.renderSectionTitle(doc, `Contexte regional - ${context.region}`);

    const x = PDF_LAYOUT.marginLeft;

    // Climat
    this.checkPageBreak(doc, 50);
    doc.fillColor(PDF_COLORS.primary).fontSize(PDF_FONTS.subSectionSize).text('Climat', x + 10, doc.y);
    doc.y += 3;
    doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize)
      .text(context.climateSummary, x + 10, doc.y, { width: PDF_LAYOUT.contentWidth - 20 });
    doc.y += 10;

    // Sols
    this.checkPageBreak(doc, 50);
    doc.fillColor(PDF_COLORS.primary).fontSize(PDF_FONTS.subSectionSize).text('Caracteristiques des sols', x + 10, doc.y);
    doc.y += 3;
    doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize)
      .text(context.soilCharacteristics, x + 10, doc.y, { width: PDF_LAYOUT.contentWidth - 20 });
    doc.y += 10;

    // Ressources en eau
    this.checkPageBreak(doc, 50);
    doc.fillColor(PDF_COLORS.primary).fontSize(PDF_FONTS.subSectionSize).text('Ressources en eau', x + 10, doc.y);
    doc.y += 3;
    doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.bodySize)
      .text(context.waterResources, x + 10, doc.y, { width: PDF_LAYOUT.contentWidth - 20 });
    doc.y += 10;

    // Defis
    this.checkPageBreak(doc, 30 + context.mainChallenges.length * 14);
    doc.fillColor(PDF_COLORS.primary).fontSize(PDF_FONTS.subSectionSize).text('Principaux defis', x + 10, doc.y);
    doc.y += 3;
    for (const challenge of context.mainChallenges) {
      doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.smallSize)
        .text(`  - ${challenge}`, x + 10, doc.y, { width: PDF_LAYOUT.contentWidth - 20 });
      doc.y += 3;
    }
    doc.y += 8;

    // Conseils specifiques
    this.checkPageBreak(doc, 30 + context.specificAdvice.length * 14);
    doc.fillColor(PDF_COLORS.primary).fontSize(PDF_FONTS.subSectionSize).text('Conseils specifiques a la region', x + 10, doc.y);
    doc.y += 3;
    for (const advice of context.specificAdvice) {
      doc.fillColor(PDF_COLORS.textMedium).fontSize(PDF_FONTS.smallSize)
        .text(`  - ${advice}`, x + 10, doc.y, { width: PDF_LAYOUT.contentWidth - 20 });
      doc.y += 3;
    }
    doc.y += 15;

    // Disclaimer final
    this.checkPageBreak(doc, 60);
    doc.rect(x, doc.y, PDF_LAYOUT.contentWidth, 45).fill('#FFF3E0');
    doc.fillColor('#E65100').fontSize(PDF_FONTS.smallSize)
      .text(
        'AVERTISSEMENT : Ce rapport est genere automatiquement a partir des donnees de sol fournies. Les recommandations sont indicatives et doivent etre validees par un agronome qualifie avant mise en oeuvre. Les couts sont estimes et peuvent varier selon les fournisseurs et les regions.',
        x + 10,
        doc.y + 8,
        { width: PDF_LAYOUT.contentWidth - 20 },
      );
    doc.y += 55;
  }

  // =============================================
  // UTILITAIRES
  // =============================================

  private renderSectionTitle(doc: PDFKit.PDFDocument, title: string): void {
    this.sectionNumber++;

    const x = PDF_LAYOUT.marginLeft;
    const y = doc.y + 10;

    doc.rect(x, y, PDF_LAYOUT.contentWidth, 30).fill(PDF_COLORS.primary);
    doc.fillColor(PDF_COLORS.white)
      .fontSize(PDF_FONTS.sectionTitleSize)
      .text(`${this.sectionNumber}. ${title}`, x + 10, y + 7, { width: PDF_LAYOUT.contentWidth - 20 });

    doc.y = y + 40;
  }

  private checkPageBreak(doc: PDFKit.PDFDocument, requiredSpace: number): void {
    const availableSpace = PDF_LAYOUT.pageHeight - PDF_LAYOUT.marginBottom - doc.y;
    if (availableSpace < requiredSpace) {
      doc.addPage();
    }
  }

  private addPageNumbers(doc: PDFKit.PDFDocument): void {
    const pages = doc.bufferedPageRange();
    for (let i = pages.start; i < pages.start + pages.count; i++) {
      doc.switchToPage(i);
      doc.fillColor(PDF_COLORS.textLight)
        .fontSize(PDF_FONTS.smallSize)
        .text(
          `Page ${i + 1} sur ${pages.count}`,
          0,
          PDF_LAYOUT.pageHeight - 35,
          { align: 'center', width: PDF_LAYOUT.pageWidth },
        );

      // Ligne de separation
      doc.rect(PDF_LAYOUT.marginLeft, PDF_LAYOUT.pageHeight - 45, PDF_LAYOUT.contentWidth, 0.5)
        .fill(PDF_COLORS.accent);
    }
  }

  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('fr-FR', options);
  }

  private getLevelColor(level: string): string {
    const normalized = level.toLowerCase();
    if (normalized.includes('excellent') || normalized.includes('bon') || normalized.includes('neutre')) {
      return PDF_COLORS.bon;
    }
    if (normalized.includes('modere') || normalized.includes('moyen') || normalized.includes('legerement')) {
      return PDF_COLORS.modere;
    }
    if (normalized.includes('bas') || normalized.includes('faible') || normalized.includes('sec') || normalized.includes('acide') || normalized.includes('alcalin')) {
      return PDF_COLORS.bas;
    }
    if (normalized.includes('deficient') || normalized.includes('critique') || normalized.includes('tres')) {
      return PDF_COLORS.deficient;
    }
    if (normalized.includes('excessif') || normalized.includes('eleve')) {
      return PDF_COLORS.excessif;
    }
    return PDF_COLORS.textMedium;
  }

  private getScoreColor(score: number): string {
    if (score >= 80) return PDF_COLORS.excellent;
    if (score >= 65) return PDF_COLORS.bon;
    if (score >= 50) return PDF_COLORS.modere;
    if (score >= 35) return PDF_COLORS.bas;
    return PDF_COLORS.deficient;
  }

  private getSuitabilityColor(suitability: string): string {
    switch (suitability) {
      case 'excellent': return PDF_COLORS.excellent;
      case 'good': return PDF_COLORS.bon;
      case 'moderate': return PDF_COLORS.modere;
      default: return PDF_COLORS.textMedium;
    }
  }
}
