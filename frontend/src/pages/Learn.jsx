import { useApp } from "../context/AppContext";
import { useI18n } from "../lib/i18n";
import Glyph from "../lib/glyphs";

export default function Learn() {
  const { user, run, openModal, showSuccess } = useApp();
  const { t, content } = useI18n();
  if (!user) return null;

  const totalLessons = content.TOPICS.reduce((n, topic) => n + topic.lessons.length, 0);
  const done = user.lessonsDone.length;
  const pct = totalLessons ? Math.round((done / totalLessons) * 100) : 0;

  const finishLesson = async (lesson) => {
    const res = await run((s) => s.completeLesson(lesson.id));
    if (!res.ok || res.data.already) return;
    showSuccess(t("learn.doneTitle"), "+10 " + t("common.points"));
  };

  const openTopic = (topic) =>
    openModal(
      <>
        <Glyph name={topic.icon} size={18} /> {topic.title}
      </>,
      (
        <div>
        {topic.lessons.map((lesson) => {
          const isDone = user.lessonsDone.includes(lesson.id);
          return (
            <div key={lesson.id} className={"lesson" + (isDone ? " done" : "")}>
              <h4>{lesson.title}</h4>
              <p>{lesson.body}</p>
              <button className="lesson-btn" disabled={isDone} onClick={() => finishLesson(lesson)}>
                {isDone ? t("learn.done") : t("learn.markDone")}
              </button>
            </div>
          );
        })}
      </div>
    ));

  return (
    <>
      <h1 className="page-title">{t("learn.title")}</h1>
      <p className="muted">{t("learn.sub")}</p>

      <div className="card">
        <div className="row-between">
          <h3 className="card-title">{t("learn.progressTitle")}</h3>
          <span className="pill">{pct}%</span>
        </div>
        <div className="bar">
          <span className="bar-fill" style={{ width: pct + "%" }} />
        </div>
        <p className="muted small">
          {t("learn.progressSub", { done, total: totalLessons })}
        </p>
      </div>

      <div className="grid-2">
        {content.TOPICS.map((topic) => {
          const doneCount = topic.lessons.filter((l) => user.lessonsDone.includes(l.id)).length;
          return (
            <div key={topic.id} className="card learn-card">
              <div className="learn-ico">
                <Glyph name={topic.icon} size={24} />
              </div>
              <div className="learn-body">
                <p className="learn-title">{topic.title}</p>
                <p className="learn-desc">{topic.desc}</p>
                <div className="learn-foot">
                  <span className="learn-progress">
                    {t("learn.count", { n: topic.lessons.length, done: doneCount })}
                  </span>
                  <button
                    className="btn btn-outline small-btn"
                    onClick={() => openTopic(topic)}
                  >
                    {doneCount === topic.lessons.length ? t("learn.readAgain") : t("learn.study")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}