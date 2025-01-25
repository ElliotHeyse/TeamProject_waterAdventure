export interface LevelProgress {
    id: string,
    firstPartCompleted: Boolean,
    fullyCompleted: Boolean,
    levelNumber: number
}

export interface Submission {
    id: string,
    videoUrl: string,
    status: string,
    feedback: string,
    medal: string,
    updatedAt: Date,
    levelNumber: number,
    isRead: Boolean
}

export interface Pupil {
    id: string,
    name: string,
    progress: number,
    levelProgress: LevelProgress[],
    submissions: Submission[]
}

export interface Message {
    id: string,
    content: string,
    isRead: Boolean,
    sender: string,
    createdAt: Date,
    coachId: string
}

export interface UserNotification {
    id: string,
    timestamp: Date,
    isRead: Boolean,
    type: string,
    title: string,
    body: string,
    levelNumber: number
}

export interface ParentUser {
    id: string,
    email: string,
    name: string,
    parent: {
        id: string,
        phone: string,
        coachId: string,
        pupils: Pupil[],
        messages: Message[]
    },
    settings: {
        pushNotifications: Boolean,
        emailNotifications: Boolean,
        theme: string,
        language: string
    },
    notifications: UserNotification[]
}

export interface ExerciseVideo {
    id: string,
    path: string
    title: string[]
}

export interface ExerciseLanguageContent {
    id: string,
    language: string,
    location: string,
    title: string,
    description: string[],
    important: string[],
    tips: string[]
}

export interface Exercise {
    id: string,
    exerciseNumber: number,
    videos: ExerciseVideo[],
    languageContents: ExerciseLanguageContent[]
}

export interface LevelLanguageContent {
    id: string,
    language: string,
    title: string,
    objectives: string[]
}

export interface Level {
    id: string,
    duration: number,
    levelNumber: number,
    exercises: Exercise[],
    languageContents: LevelLanguageContent[]
}