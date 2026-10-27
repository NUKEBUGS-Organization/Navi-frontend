import { THEME_BLUE } from "@/constants";
import { ConfirmActionModal } from "./ConfirmActionModal";

export type RecordAction<T> = { kind: "archive" | "restore" | "delete"; item: T };

interface RecordActionModalProps {
  action: RecordAction<{ title: string }> | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/** Archive / restore / permanent-delete confirmation for an initiative. */
export function InitiativeActionModal({ action, onClose, onConfirm }: RecordActionModalProps) {
  const title = action?.item.title ?? "";
  const props =
    action?.kind === "delete"
      ? {
          title: "Delete initiative permanently",
          confirmLabel: "Delete permanently",
          color: "red",
          requireTypedText: title,
          message: (
            <>
              This permanently deletes <b>{title}</b> and everything linked to it: roadmap tasks and
              comments, risks, communications, stakeholders, adoption milestones, kudos, Knowledge Hub
              entries and files, and assessments with their submissions. <b>This cannot be undone.</b>
            </>
          ),
        }
      : action?.kind === "restore"
        ? {
            title: "Restore initiative",
            confirmLabel: "Restore",
            color: THEME_BLUE,
            message: (
              <>
                <b>{title}</b> will appear again in initiative lists, the Executive Dashboard and all rollups.
              </>
            ),
          }
        : {
            title: "Archive initiative",
            confirmLabel: "Archive",
            color: THEME_BLUE,
            message: (
              <>
                <b>{title}</b> will be hidden from initiative lists, the Executive Dashboard and all rollups,
                and its assessments will close. Nothing is deleted: you can restore it any time from the
                Archived view on the Initiatives page.
              </>
            ),
          };
  return <ConfirmActionModal opened={action !== null} onClose={onClose} onConfirm={onConfirm} {...props} />;
}

/** Archive / restore / permanent-delete confirmation for an assessment. */
export function AssessmentActionModal({ action, onClose, onConfirm }: RecordActionModalProps) {
  const title = action?.item.title ?? "";
  const props =
    action?.kind === "delete"
      ? {
          title: "Delete assessment permanently",
          confirmLabel: "Delete permanently",
          color: "red",
          requireTypedText: title,
          message: (
            <>
              This permanently deletes <b>{title}</b>, all of its submissions, and the kudos those submissions
              earned. <b>This cannot be undone.</b>
            </>
          ),
        }
      : action?.kind === "restore"
        ? {
            title: "Restore assessment",
            confirmLabel: "Restore",
            color: THEME_BLUE,
            message: (
              <>
                <b>{title}</b> can be taken again, and its submissions count toward readiness and NAVI scores.
              </>
            ),
          }
        : {
            title: "Archive assessment",
            confirmLabel: "Archive",
            color: THEME_BLUE,
            message: (
              <>
                <b>{title}</b> will close to new submissions, and its existing submissions will stop counting
                toward readiness and NAVI scores. Nothing is deleted: you can restore it any time from the
                Archived tab on the Assessments page.
              </>
            ),
          };
  return <ConfirmActionModal opened={action !== null} onClose={onClose} onConfirm={onConfirm} {...props} />;
}
